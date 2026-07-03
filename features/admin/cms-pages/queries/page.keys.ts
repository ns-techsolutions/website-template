export const pageKeys = {
  all: ["cms", "pages"] as const,
  lists: () => [...pageKeys.all, "list"] as const,
  detail: (id: string) => [...pageKeys.all, "detail", id] as const,
};
