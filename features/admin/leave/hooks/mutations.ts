"use client";

import type { LeaveStatus } from "@/lib/admin/types";
import { useAppMutation } from "@/lib/query/use-app-mutation";
import { leaveKeys } from "../queries/leave.keys";
import { leaveApi } from "../services/leave-query.service";
import type { NewLeaveRequest } from "../types/leave.api";

export function useCreateLeave() {
  return useAppMutation({
    mutationFn: (input: NewLeaveRequest) => leaveApi.create(input),
    invalidateKeys: [leaveKeys.lists()],
    successMessage: "Leave request created",
  });
}

export function useSetLeaveStatus() {
  return useAppMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveStatus }) =>
      leaveApi.setStatus(id, status),
    invalidateKeys: [leaveKeys.lists()],
    successMessage: "Leave status updated",
  });
}

export function useDeleteLeave() {
  return useAppMutation({
    mutationFn: (id: string) => leaveApi.remove(id),
    invalidateKeys: [leaveKeys.lists()],
    successMessage: "Leave request deleted",
  });
}
