import { z } from "zod";

export const createOrderSchema = z.object({
  type: z.enum(["EXPORT", "IMPORT"]),
  contractId: z.string().optional(),
  productDescription: z.string().min(1, "Bắt buộc"),
  hsCode: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  totalValue: z.number().positive().optional(),
  currency: z.enum(["USD", "CNY", "VND"]).default("USD"),
  incoterms: z.string().optional(),
  borderGate: z.string().optional(),
  transportMode: z.enum(["ROAD", "RAIL", "SEA", "AIR"]).optional(),
  notes: z.string().optional(),
});

export const updateOrderSchema = createOrderSchema.partial().extend({
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
});

export const orderFilterSchema = z.object({
  type: z.enum(["EXPORT", "IMPORT"]).optional(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  stage: z.coerce.number().int().min(1).max(10).optional(),
  borderGate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderFilter = z.infer<typeof orderFilterSchema>;
