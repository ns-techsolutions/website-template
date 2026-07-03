export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  detail: (id: string) => [...reviewKeys.all, "detail", id] as const,
};
