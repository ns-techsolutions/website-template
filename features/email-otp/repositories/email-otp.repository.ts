import type { EmailOtp } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";

import type { EmailOtpPurpose } from "../types/email-otp.api";

// One-time passcodes live in the request's tenant DB (see getTenantDb), mirroring
// the password-reset token repository. Only the code hash is persisted.
export const emailOtpRepository = {
  async create(
    email: string,
    purpose: EmailOtpPurpose,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const db = await getTenantDb();
    await db.emailOtp.create({ data: { email, purpose, codeHash, expiresAt } });
  },

  /** Most recent unconsumed, unexpired code for this email + flow (or null). */
  async findLatestActive(
    email: string,
    purpose: EmailOtpPurpose,
  ): Promise<EmailOtp | null> {
    const db = await getTenantDb();
    return db.emailOtp.findFirst({
      where: { email, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  },

  async incrementAttempts(id: string): Promise<void> {
    const db = await getTenantDb();
    await db.emailOtp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  async markConsumed(id: string): Promise<void> {
    const db = await getTenantDb();
    await db.emailOtp.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },

  /** Drops any still-active codes so a freshly issued one is the only valid code. */
  async deleteActiveFor(
    email: string,
    purpose: EmailOtpPurpose,
  ): Promise<void> {
    const db = await getTenantDb();
    await db.emailOtp.deleteMany({ where: { email, purpose, consumedAt: null } });
  },
};
