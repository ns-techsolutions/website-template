export const openingHoursKeys = {
  all: ["opening-hours"] as const,
  detail: () => [...openingHoursKeys.all, "detail"] as const,
};
