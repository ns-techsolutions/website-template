import type { LeaveType } from "@/lib/admin/types";

// Client → server payload for creating a leave request. Dates are sent as
// "yyyy-MM-dd" strings (from the date inputs) and coerced server-side.
export interface NewLeaveRequest {
  staffId: string;
  type: LeaveType;
  from: string;
  to: string;
  reason?: string;
}
