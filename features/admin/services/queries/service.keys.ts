export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (categoryId?: string) =>
    [...serviceKeys.lists(), categoryId ?? "all"] as const,
  detail: (id: string) => [...serviceKeys.all, "detail", id] as const,
};
