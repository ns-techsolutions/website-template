"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { appointmentKeys } from "../queries/appointment.keys";
import { appointmentApi } from "../services/appointment-query.service";

export function useAppointments() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...appointmentKeys.lists(), workspaceId],
    queryFn: () => appointmentApi.list(),
  });
}
