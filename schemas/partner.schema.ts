import { z } from "zod";

export const createPartnerSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  type: z.enum([
    "BUYER",
    "SUPPLIER",
    "FREIGHT_FORWARDER",
    "CUSTOMS_BROKER",
    "INSPECTION_AGENCY",
    "OTHER",
  ]),
  country: z.enum(["VN", "CN", "OTHER"]).default("VN"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  taxCode: z.string().optional(),
  licenseNumber: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
