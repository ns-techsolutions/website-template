import { z } from "zod";

import { requiredPhone } from "@/lib/phone/validation";

export const appointmentFormSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name"),
  lastName: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: requiredPhone,
  service: z.string().trim().min(1, "Please choose a service"),
  staff: z.string().trim().optional(),
  date: z.date({ message: "Please choose an appointment date" }),
  time: z.string().min(1, "Please choose a time slot"),
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
