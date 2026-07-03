import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import type { Customer } from "@/lib/admin/types";

import { customerRepository } from "../repositories/customer.repository";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.schema";

export const customerService = {
  list(q?: string): Promise<Customer[]> {
    return customerRepository.list(q);
  },

  async get(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError("Customer not found.");
    return customer;
  },

  async create(raw: unknown): Promise<Customer> {
    const input = createCustomerSchema.parse(raw);
    // Staff-created customers have no login yet — set an unusable random password
    // they can replace later via the password-reset flow.
    const password = await hashPassword(randomUUID());
    try {
      return await customerRepository.create({ ...input, password });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictError("A customer with this email already exists.");
      }
      throw e;
    }
  },

  async update(id: string, raw: unknown): Promise<Customer> {
    const input = updateCustomerSchema.parse(raw);
    const updated = await customerRepository.update(id, input);
    if (!updated) throw new NotFoundError("Customer not found.");
    return updated;
  },
};
