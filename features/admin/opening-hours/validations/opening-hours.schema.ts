import { z } from "zod";

const openingHourSchema = z.object({
  day: z.string().trim().min(1),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
  closed: z.boolean(),
});

const closureSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd"),
  reason: z.string(),
});

export const updateSalonHoursSchema = z.object({
  openingHours: z.array(openingHourSchema),
  closures: z.array(closureSchema),
  slotDurationMinutes: z.number().int().min(5).max(240),
  bufferMinutes: z.number().int().min(0).max(240),
  cancellationCutoffHours: z.number().int().min(0).max(720),
});

export type UpdateSalonHoursInput = z.infer<typeof updateSalonHoursSchema>;
