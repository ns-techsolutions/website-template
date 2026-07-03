export const mediaKeys = {
  all: ["cms", "media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
};
