export const salonSettingsKeys = {
  all: ["salon-settings"] as const,
  detail: () => [...salonSettingsKeys.all, "detail"] as const,
};
