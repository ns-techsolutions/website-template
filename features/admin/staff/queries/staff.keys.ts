export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  detail: (id: string) => [...staffKeys.all, "detail", id] as const,
};
