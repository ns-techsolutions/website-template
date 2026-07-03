export const customerReviewKeys = {
  all: ["customer-reviews"] as const,
  mine: () => [...customerReviewKeys.all, "mine"] as const,
};
