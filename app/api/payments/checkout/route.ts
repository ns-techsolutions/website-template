import { z } from "zod";
import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/api/errors";
import { getOptionalAuthUser } from "@/lib/auth/get-auth-user";
import { getTenantDb } from "@/lib/db/tenant";
import { bookingRepository } from "@/features/bookings/repositories/booking.repository";
import { paymentRepository } from "@/features/bookings/repositories/payment.repository";
import { integrationSettingsService } from "@/features/admin/integrations/services/integration-settings.service";
import { getPaymentProvider } from "@/lib/payments/registry";
import { publicOrigin } from "@/lib/net/request-origin";
import { PaymentStatus } from "@prisma/client";

const bodySchema = z.object({
  bookingId: z.string().min(1),
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await getOptionalAuthUser(req);
  const body = await req.json().catch(() => ({}));
  const { bookingId } = bodySchema.parse(body);

  const db = await getTenantDb();

  const workspace = await db.workspace.findFirst({
    select: {
      id: true,
      slug: true,
      salonSettings: { select: { currency: true } },
    },
  });
  if (!workspace) throw new NotFoundError("Workspace not found");

  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");

  // Logged-in customers may only pay for their own bookings.
  // Guests are trusted via the unguessable bookingId returned from the create step.
  if (
    user !== null &&
    user.role === "customer" &&
    booking.userId !== user.id &&
    booking.email !== user.email
  ) {
    throw new ForbiddenError();
  }

  if (!booking.serviceId) {
    throw new BadRequestError("Booking has no linked service");
  }

  const service = await db.service.findUnique({
    where: { id: booking.serviceId },
    select: { requiresDeposit: true, depositAmount: true, name: true },
  });

  if (!service?.requiresDeposit || !service.depositAmount) {
    throw new BadRequestError("This service does not require a deposit");
  }

  const settings = await integrationSettingsService.getResolved(workspace.id);

  if (settings.paymentProvider === "none") {
    throw new BadRequestError("Online payments are not enabled for this salon");
  }
  if (!settings.stripeSecretKey) {
    throw new BadRequestError("Payment gateway credentials are not configured");
  }

  const provider = getPaymentProvider(settings.paymentProvider);
  const currency = workspace.salonSettings?.currency ?? "gbp";

  // Build redirect URLs from the public host the customer is on, not
  // `req.nextUrl.origin` (which is the app's internal bind address behind the proxy).
  const origin = publicOrigin(req);

  const result = await provider.createCheckout(
    {
      amount: service.depositAmount,
      currency,
      bookingReference: booking.reference,
      customerEmail: booking.email,
      serviceName: service.name,
    },
    {
      secretKey: settings.stripeSecretKey,
      successUrl: `${origin}/booking/success?ref=${booking.reference}`,
      cancelUrl: `${origin}/booking/cancelled?ref=${booking.reference}`,
      tenantSlug: workspace.slug,
    },
  );

  const payment = await paymentRepository.create({
    workspaceId: workspace.id,
    bookingId: booking.id,
    provider: settings.paymentProvider,
    amount: service.depositAmount,
    currency,
    status: PaymentStatus.pending,
    providerRef: result.providerRef ?? null,
  });

  return successJson({ url: result.url, paymentId: payment.id });
});
