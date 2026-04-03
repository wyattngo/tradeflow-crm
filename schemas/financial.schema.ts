import { z } from "zod";

export const createFinancialSchema = z.object({
  orderId: z.string().min(1),
  type: z.enum([
    "IMPORT_TAX",
    "VAT",
    "CUSTOMS_FEE",
    "INSPECTION_FEE",
    "FREIGHT",
    "INSURANCE",
    "PAYMENT_RECEIVED",
    "PAYMENT_SENT",
    "OTHER",
  ]),
  amount: z.number().positive(),
  currency: z.enum(["USD", "CNY", "VND"]),
  exchangeRate: z.number().positive().optional(),
  amountVnd: z.number().optional(),
  paidAt: z.string().optional(),
  paymentRef: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateFinancialInput = z.infer<typeof createFinancialSchema>;
