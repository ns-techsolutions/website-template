export const leaveKeys = {
  all: ["leave"] as const,
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (status?: string) => [...leaveKeys.lists(), status ?? "all"] as const,
};
