"use client";

import { apiFetch } from "@/lib/api/client";
import type { CreateContactInput } from "../validations/contact.schema";

export const contactApi = {
  submit: (body: CreateContactInput) =>
    apiFetch<null>("/api/contact", { method: "POST", body }),
};
