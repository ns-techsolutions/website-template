import { dashboardRepository } from "../repositories/dashboard.repository";
import type { DashboardData } from "../types/dashboard.dto";

export const dashboardService = {
  get(): Promise<DashboardData> {
    return dashboardRepository.get();
  },
};
