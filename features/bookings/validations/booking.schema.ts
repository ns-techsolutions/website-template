import { z } from "zod";

import { otpCodeSchema } from "@/features/email-otp/validations/email-otp.schema";
import { optionalPhoneOrUndefined } from "@/lib/phone/validation";

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const createBookingSchema = z
  .object({
    customerName: z.string().trim().min(1, "Please enter your name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: optionalPhoneOrUndefined,
    // Either a catalog `serviceId` (preferred — name/price/duration resolved
    // server-side) or a free-text `service` label must be provided.
    service: z.string().trim().optional(),
    serviceId: optionalTrimmed,
    staff: optionalTrimmed,
    staffId: optionalTrimmed,
    // Accepts an ISO/"yyyy-MM-dd" string from the client and coerces to a Date.
    date: z.coerce.date({ message: "Please choose a valid date" }),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time slot"),
    // Email-verification code — required only for guest bookings (enforced in the
    // use case); signed-in users and email-disabled salons skip it.
    code: otpCodeSchema.optional(),
  })
  .refine((v) => Boolean(v.serviceId || v.service), {
    message: "Please choose a service",
    path: ["service"],
  });

export const updateBookingSchema = z
  .object({
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled", "no_show"])
      .optional(),
    date: z.coerce.date().optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  })
  .refine((v) => v.status || v.date || v.time, {
    message: "Provide at least one field to update",
  });

export const rescheduleBookingFormSchema = z.object({
  date: z.string().min(1, "Please choose a date"),
  time: z.string().min(1, "Please choose a time"),
});

export type RescheduleBookingFormInput = z.infer<typeof rescheduleBookingFormSchema>;
