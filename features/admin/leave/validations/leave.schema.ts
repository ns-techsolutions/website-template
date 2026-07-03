import { z } from "zod";

export const createLeaveSchema = z.object({
  staffId: z.string().trim().min(1, "Staff is required"),
  type: z.enum(["annual", "sick", "unpaid", "maternity", "other"]),
  from: z.coerce.date({ message: "Start date is required" }),
  to: z.coerce.date({ message: "End date is required" }),
  reason: z.string().trim().optional(),
});

export const updateLeaveSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

// Client-side form variant — dates stay as "yyyy-MM-dd" strings from the
// date inputs; the server-side schema above coerces them to `Date`.
export const createLeaveFormSchema = z.object({
  staffId: z.string().trim().min(1, "Staff is required"),
  type: z.enum(["annual", "sick", "unpaid", "maternity", "other"]),
  from: z.string().min(1, "Start date is required"),
  to: z.string().min(1, "End date is required"),
  reason: z.string().trim().optional(),
});

export type CreateLeaveFormInput = z.infer<typeof createLeaveFormSchema>;
