export const settingsKeys = {
  all: ["cms", "settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
};
