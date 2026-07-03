export const workspaceKeys = {
  all: ["cms", "workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
};
