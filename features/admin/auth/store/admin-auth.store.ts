"use client";

import { createAuthStore } from "@/features/auth/store/create-auth-store";

/**
 * Admin panel (master + tenant) auth store. Kept entirely separate from the
 * customer store (`reine.auth.customer`) so signing into the panel never marks
 * the user as logged-in on the public site.
 */
export const useAdminAuthStore = createAuthStore("reine.auth.admin");
