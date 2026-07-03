import { toast } from "sonner";

/**
 * Thin wrapper around sonner so call sites depend on this service rather than
 * the toast library directly. Lets us swap implementations or add behavior
 * (logging, dedup, etc.) in one place.
 */
export const toastService = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
};
