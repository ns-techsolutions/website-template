import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import type { CustomerReview, Review } from "@/lib/admin/types";

import {
  reviewRepository,
  toCustomerReviewDto,
  toReviewDto,
} from "../repositories/review.repository";
import {
  createReviewSchema,
  customerReviewSchema,
  updateReviewSchema,
} from "../validations/review.schema";

export const reviewService = {
  async list(workspaceId: string): Promise<Review[]> {
    return (await reviewRepository.list(workspaceId)).map(toReviewDto);
  },

  async listPublished(workspaceId: string): Promise<Review[]> {
    return (await reviewRepository.listPublished(workspaceId)).map(toReviewDto);
  },

  async create(workspaceId: string, raw: unknown): Promise<Review> {
    const input = createReviewSchema.parse(raw);
    return toReviewDto(await reviewRepository.create(workspaceId, input));
  },

  /**
   * Customer-submitted review (storefront). Verifies the booking belongs to the
   * signed-in customer and is completed, snapshots the customer + service name
   * from it, and stores it unpublished so it enters the admin moderation queue.
   */
  async submitForCustomer(
    workspaceId: string,
    userId: string,
    raw: unknown,
  ): Promise<Review> {
    const input = customerReviewSchema.parse(raw);
    const db = await getTenantDb();

    const booking = await db.booking.findUnique({
      where: { id: input.bookingId },
    });
    if (!booking || booking.userId !== userId) {
      throw new ForbiddenError("You can only review your own bookings.");
    }
    if (booking.status !== "completed") {
      throw new ForbiddenError("You can only review completed appointments.");
    }

    const existing = await reviewRepository.findByBookingId(
      workspaceId,
      input.bookingId,
    );
    if (existing) {
      throw new ConflictError("You've already reviewed this appointment.");
    }

    const created = await reviewRepository.create(workspaceId, {
      customer: booking.customerName,
      service: booking.service,
      rating: input.rating,
      comment: input.comment ?? "",
      bookingId: input.bookingId,
      published: false,
    });
    return toReviewDto(created);
  },

  /** The signed-in customer's own reviews (any status), keyed by booking. */
  async listForCustomer(
    workspaceId: string,
    userId: string,
  ): Promise<CustomerReview[]> {
    const db = await getTenantDb();
    const bookings = await db.booking.findMany({
      where: { userId },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);
    if (bookingIds.length === 0) return [];
    const rows = await reviewRepository.listByBookingIds(workspaceId, bookingIds);
    return rows.map(toCustomerReviewDto);
  },

  async update(workspaceId: string, id: string, raw: unknown): Promise<Review> {
    const input = updateReviewSchema.parse(raw);
    const existing = await reviewRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Review not found.");
    return toReviewDto(await reviewRepository.update(id, input));
  },

  async remove(workspaceId: string, id: string): Promise<Review> {
    const existing = await reviewRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Review not found.");
    return toReviewDto(await reviewRepository.remove(id));
  },
};
