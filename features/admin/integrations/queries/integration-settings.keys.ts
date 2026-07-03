export const integrationSettingsKeys = {
  all: ["integration-settings"] as const,
  detail: () => [...integrationSettingsKeys.all, "detail"] as const,
};
