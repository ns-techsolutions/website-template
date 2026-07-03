import { getTenantDb } from "@/lib/db/tenant";
import type { UserEntity } from "../types/auth.entity";

// Customers and tenant admins live in their salon's own database. These lookups
// therefore resolve against the request's tenant DB (see getTenantDb), so the
// same email can exist independently across salons.
export const userRepository = {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const db = await getTenantDb();
    return db.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<UserEntity | null> {
    const db = await getTenantDb();
    return db.user.findUnique({ where: { id } });
  },

  async create(data: {
    name: string;
    email: string;
    phone: string | null;
    password: string;
  }): Promise<UserEntity> {
    const db = await getTenantDb();
    return db.user.create({ data });
  },

  async update(
    id: string,
    data: { name?: string; email?: string; phone?: string | null },
  ): Promise<UserEntity> {
    const db = await getTenantDb();
    return db.user.update({ where: { id }, data });
  },

  async updatePassword(id: string, password: string): Promise<UserEntity> {
    const db = await getTenantDb();
    return db.user.update({ where: { id }, data: { password } });
  },
};
