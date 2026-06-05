import { z } from "zod";

export const tradeLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
  fmv: z.number().nonnegative().optional(),
});

export const createBusinessSchema = z.object({
  legalName: z.string().min(1).max(200),
  dba: z.string().max(200).optional(),
  metro: z.string().min(1).max(100),
  vertical: z.string().min(1).max(100),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
});

export const createListingSchema = z.object({
  listingType: z.enum(["offer", "need"]),
  category: z.string().min(1).max(100),
  unit: z.string().min(1).max(50),
  quantity: z.number().positive().default(1),
  fmvEstimate: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export const swipeProposalSchema = z.object({
  proposalId: z.string().uuid(),
  action: z.enum(["interested", "pass", "save"]),
  reasonTags: z.array(z.string().max(50)).max(10).optional(),
});

export const acceptProposalSchema = z.object({
  proposalId: z.string().uuid(),
  taxAcknowledged: z.literal(true),
});

export const createProposalSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  tradeType: z.enum(["direct", "multi_party"]).default("direct"),
  metro: z.string().max(100).optional(),
  vertical: z.string().max(100).optional(),
  cashTopupDisplay: z.number().nonnegative().optional(),
  parties: z
    .array(
      z.object({
        businessId: z.string().uuid(),
        giveLines: z.array(tradeLineItemSchema).min(1),
        receiveLines: z.array(tradeLineItemSchema).min(1),
        estimatedFmv: z.number().nonnegative().optional(),
      }),
    )
    .min(2),
});

export const vendorRatingSchema = z.object({
  tradeId: z.string().uuid(),
  ratedBusinessId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  tags: z.array(z.enum(["quality", "timeliness", "communication"])).optional(),
  comment: z.string().max(1000).optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SwipeProposalInput = z.infer<typeof swipeProposalSchema>;
export type AcceptProposalInput = z.infer<typeof acceptProposalSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type VendorRatingInput = z.infer<typeof vendorRatingSchema>;
