"use client";

import { apiFetch } from "@/lib/api/client";
import type { SubscribeInput } from "../validations/newsletter.schema";

export const newsletterApi = {
  subscribe: (body: SubscribeInput) =>
    apiFetch<null>("/api/newsletter", { method: "POST", body }),
};
