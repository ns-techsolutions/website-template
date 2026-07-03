export const serviceCategoryKeys = {
  all: ["service-categories"] as const,
  lists: () => [...serviceCategoryKeys.all, "list"] as const,
  detail: (id: string) => [...serviceCategoryKeys.all, "detail", id] as const,
};
