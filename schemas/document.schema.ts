import { z } from "zod";

export const createDocumentSchema = z.object({
  orderId: z.string().min(1),
  docType: z.enum([
    "INVOICE",
    "PACKING_LIST",
    "CERTIFICATE_OF_ORIGIN",
    "CUSTOMS_DECLARATION",
    "QUARANTINE_CERT",
    "BL_AWB",
    "QUALITY_CERT",
    "TAX_PAYMENT_RECEIPT",
    "SPECIALIZED_INSPECTION",
    "PHYTOSANITARY_CERT",
    "FUMIGATION_CERT",
    "PAYMENT_CONFIRMATION",
    "OTHER",
  ]),
  docNumber: z.string().optional(),
  issuedBy: z.string().optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileKey: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  status: z.enum(["PENDING", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
