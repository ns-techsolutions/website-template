export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
};
