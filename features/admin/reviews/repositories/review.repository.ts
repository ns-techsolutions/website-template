import type { Review as ReviewModel } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { CustomerReview, Review } from "@/lib/admin/types";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validations/review.schema";

export function toReviewDto(row: ReviewModel): Review {
  return {
    id: row.id,
    customer: row.customer,
    service: row.service,
    rating: row.rating,
    comment: row.comment,
    date: row.createdAt.toISOString().slice(0, 10),
    published: row.published,
  };
}

export function toCustomerReviewDto(row: ReviewModel): CustomerReview {
  return {
    id: row.id,
    bookingId: row.bookingId,
    service: row.service,
    rating: row.rating,
    comment: row.comment,
    date: row.createdAt.toISOString().slice(0, 10),
    published: row.published,
  };
}

export const reviewRepository = {
  async list(workspaceId: string): Promise<ReviewModel[]> {
    const db = await getTenantDb();
    return db.review.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async listPublished(workspaceId: string): Promise<ReviewModel[]> {
    const db = await getTenantDb();
    return db.review.findMany({
      where: { workspaceId, published: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(workspaceId: string, id: string): Promise<ReviewModel | null> {
    const db = await getTenantDb();
    return db.review.findFirst({ where: { id, workspaceId } });
  },

  async findByBookingId(
    workspaceId: string,
    bookingId: string,
  ): Promise<ReviewModel | null> {
    const db = await getTenantDb();
    return db.review.findFirst({ where: { workspaceId, bookingId } });
  },

  async listByBookingIds(
    workspaceId: string,
    bookingIds: string[],
  ): Promise<ReviewModel[]> {
    const db = await getTenantDb();
    return db.review.findMany({
      where: { workspaceId, bookingId: { in: bookingIds } },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(workspaceId: string, input: CreateReviewInput): Promise<ReviewModel> {
    const db = await getTenantDb();
    return db.review.create({
      data: {
        workspaceId,
        customer: input.customer,
        service: input.service,
        rating: input.rating,
        comment: input.comment ?? "",
        bookingId: input.bookingId,
        published: input.published ?? false,
      },
    });
  },

  async update(id: string, input: UpdateReviewInput): Promise<ReviewModel> {
    const db = await getTenantDb();
    return db.review.update({
      where: { id },
      data: {
        ...(input.customer !== undefined && { customer: input.customer }),
        ...(input.service !== undefined && { service: input.service }),
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.comment !== undefined && { comment: input.comment }),
        ...(input.published !== undefined && { published: input.published }),
      },
    });
  },

  async remove(id: string): Promise<ReviewModel> {
    const db = await getTenantDb();
    return db.review.delete({ where: { id } });
  },
};
