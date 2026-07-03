export const catalogKeys = {
  all: ["catalog"] as const,
  services: () => [...catalogKeys.all, "services"] as const,
  staff: () => [...catalogKeys.all, "staff"] as const,
  hours: () => [...catalogKeys.all, "hours"] as const,
  availability: (date: string, serviceId?: string, staffId?: string) =>
    [...catalogKeys.all, "availability", date, serviceId ?? "", staffId ?? ""] as const,
};
