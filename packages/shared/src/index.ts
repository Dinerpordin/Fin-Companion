import { z } from "zod";

// ─── Institution ─────────────────────────────────────────────────────────────

export const InstitutionTypeSchema = z.enum([
  "bank",
  "mfi",
  "ngo",
  "agent_banking",
  "insurance",
  "other",
]);
export type InstitutionType = z.infer<typeof InstitutionTypeSchema>;

export const InstitutionSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_bn: z.string(),
  institution_type: InstitutionTypeSchema,
  regulator: z.string().optional(),
  website_url: z.string().url().optional(),
  phone_public: z.string().optional(),
  is_islamic: z.boolean().default(false),
  last_verified_at: z.string().datetime().optional(),
});
export type Institution = z.infer<typeof InstitutionSchema>;

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductCategorySchema = z.enum([
  "fd",
  "dps",
  "savings",
  "personal_loan",
  "credit_card",
  "home_loan",
  "auto_loan",
  "insurance",
  "other",
]);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductStatusSchema = z.enum(["active", "inactive", "unverified"]);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  institution_id: z.string().uuid(),
  category: ProductCategorySchema,
  name_en: z.string(),
  name_bn: z.string(),
  description_short_bn: z.string().optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  min_tenor_months: z.number().int().optional(),
  max_tenor_months: z.number().int().optional(),
  islamic_flag: z.boolean().default(false),
  official_url: z.string().url().optional(),
  status: ProductStatusSchema.default("active"),
  institution: InstitutionSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// ─── Product Rate ─────────────────────────────────────────────────────────────

export const ConfidenceFlagSchema = z.enum(["high", "medium", "low"]);
export type ConfidenceFlag = z.infer<typeof ConfidenceFlagSchema>;

export const ProductRateSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  rate_type: z.string(), // e.g. "interest_rate", "profit_rate", "apr"
  nominal_rate: z.number(),
  effective_notes: z.string().optional(),
  fee_notes: z.string().optional(),
  valid_from: z.string().datetime().optional(),
  verified_at: z.string().datetime(),
  source_id: z.string().uuid(),
  confidence_flag: ConfidenceFlagSchema.default("medium"),
});
export type ProductRate = z.infer<typeof ProductRateSchema>;

// ─── Product Fee ──────────────────────────────────────────────────────────────

export const ProductFeeSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  fee_name: z.string(),
  fee_amount: z.number().optional(),
  fee_type: z.string(), // "flat" | "percent" | "range"
  notes: z.string().optional(),
  verified_at: z.string().datetime(),
  source_id: z.string().uuid(),
});
export type ProductFee = z.infer<typeof ProductFeeSchema>;

// ─── Source Record ────────────────────────────────────────────────────────────

export const SourceStatusSchema = z.enum([
  "active",
  "stale",
  "error",
  "manual",
]);
export type SourceStatus = z.infer<typeof SourceStatusSchema>;

export const SourceRecordSchema = z.object({
  id: z.string().uuid(),
  source_url: z.string().url(),
  source_type: z.string(), // "official_website" | "bb_table" | "manual" | "pdf"
  scraped_at: z.string().datetime(),
  parser_version: z.string().optional(),
  raw_hash: z.string().optional(),
  status: SourceStatusSchema.default("active"),
});
export type SourceRecord = z.infer<typeof SourceRecordSchema>;

// ─── Location ─────────────────────────────────────────────────────────────────

export const LocationTypeSchema = z.enum(["branch", "atm", "agent", "mfi_office"]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const LocationSchema = z.object({
  id: z.string().uuid(),
  institution_id: z.string().uuid(),
  location_type: LocationTypeSchema,
  branch_name: z.string(),
  district: z.string(),
  upazila: z.string().optional(),
  address_text: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  products_supported: z.array(ProductCategorySchema).default([]),
  phone_public: z.string().optional(),
  verified_at: z.string().datetime(),
  source_url: z.string().url().optional(),
  distance_km: z.number().optional(), // computed at query time
  institution: InstitutionSchema.optional(),
});
export type Location = z.infer<typeof LocationSchema>;

// ─── Document Checklist ───────────────────────────────────────────────────────

export const DocumentChecklistSchema = z.object({
  id: z.string().uuid(),
  institution_id: z.string().uuid().optional(),
  product_category: ProductCategorySchema,
  checklist_bn: z.array(z.string()),
  checklist_en: z.array(z.string()).optional(),
  verified_at: z.string().datetime(),
  source_id: z.string().uuid().optional(),
  institution: InstitutionSchema.optional(),
});
export type DocumentChecklist = z.infer<typeof DocumentChecklistSchema>;

// ─── Analytics (binned — no raw financial data) ───────────────────────────────

export const AmountBandSchema = z.enum([
  "under_10k",
  "10k_50k",
  "50k_200k",
  "200k_1m",
  "over_1m",
]);
export type AmountBand = z.infer<typeof AmountBandSchema>;

export const CostBandSchema = z.enum(["low", "medium", "high", "very_high"]);
export type CostBand = z.infer<typeof CostBandSchema>;

export const RegionTypeSchema = z.enum(["rural", "semi_urban", "urban", "unknown"]);
export type RegionType = z.infer<typeof RegionTypeSchema>;

export const AnalyticsEventBinnedSchema = z.object({
  session_id_rotating: z.string(),
  tool_name: z.string(),
  intent_class: z.string().optional(),
  amount_band: AmountBandSchema.optional(),
  purpose_band: z.string().optional(),
  lender_type: z.string().optional(),
  cost_band: CostBandSchema.optional(),
  region_type: RegionTypeSchema.optional(),
  event_month: z.string(), // "YYYY-MM"
});
export type AnalyticsEventBinned = z.infer<typeof AnalyticsEventBinnedSchema>;

// ─── Loan Calculator ──────────────────────────────────────────────────────────

export const LoanFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
]);
export type LoanFrequency = z.infer<typeof LoanFrequencySchema>;

export const LoanCalculatorInputSchema = z.object({
  loan_amount: z.number().positive(),
  instalment_amount: z.number().positive(),
  frequency: LoanFrequencySchema,
  instalment_count: z.number().int().positive(),
  upfront_fees: z.number().min(0).default(0),
  label: z.string().optional(), // for multi-loan labelling
});
export type LoanCalculatorInput = z.infer<typeof LoanCalculatorInputSchema>;

export const LoanCalculatorOutputSchema = z.object({
  total_repay: z.number(),
  total_extra_paid: z.number(),
  time_remaining_months: z.number(),
  cost_band: CostBandSchema,
  approximate_apr_percent: z.number().optional(),
});
export type LoanCalculatorOutput = z.infer<typeof LoanCalculatorOutputSchema>;

export const MultiLoanOutputSchema = z.object({
  loans: z.array(
    z.object({
      input: LoanCalculatorInputSchema,
      output: LoanCalculatorOutputSchema,
    })
  ),
  total_monthly_burden: z.number(),
  combined_total_repay: z.number(),
  combined_total_extra_paid: z.number(),
});
export type MultiLoanOutput = z.infer<typeof MultiLoanOutputSchema>;

// ─── Assistant ────────────────────────────────────────────────────────────────

export const AssistantIntentSchema = z.enum([
  "loan_assessment",
  "loan_simulation",
  "product_comparison",
  "nearest_provider",
  "how_to_apply",
  "health_snapshot",
  "accounting_help",
  "financial_education",
  "out_of_scope",
]);
export type AssistantIntent = z.infer<typeof AssistantIntentSchema>;

export const AssistantNextActionSchema = z.object({
  type: z.enum(["open_tool", "open_comparison", "open_locator", "open_checklist", "open_scenario"]),
  target: z.string(),
  label_bn: z.string(),
  category: ProductCategorySchema.optional(),
});
export type AssistantNextAction = z.infer<typeof AssistantNextActionSchema>;

export const AssistantRequestSchema = z.object({
  session_id: z.string(),
  locale: z.enum(["bn-BD", "en"]).default("bn-BD"),
  message: z.string().max(2000),
  channel: z.enum(["web_text", "web_voice"]).default("web_text"),
  context: z
    .object({
      district: z.string().optional(),
      upazila: z.string().optional(),
    })
    .optional(),
});
export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantStructuredPayloadSchema = z.object({
  loan_summary: LoanCalculatorOutputSchema.nullable().optional(),
  comparison_options: z.array(ProductSchema).optional(),
  nearest_locations: z.array(LocationSchema).optional(),
  checklist: DocumentChecklistSchema.nullable().optional(),
  scenario_output: MultiLoanOutputSchema.nullable().optional(),
});
export type AssistantStructuredPayload = z.infer<typeof AssistantStructuredPayloadSchema>;

export const AssistantResponseSchema = z.object({
  intent: AssistantIntentSchema,
  reply_text_bn: z.string(),
  reply_text_en: z.string().optional(),
  disclaimer_bn: z
    .string()
    .default("এটি শুধু তথ্য প্রদান করে, ব্যক্তিগত আর্থিক পরামর্শ নয়।"),
  next_actions: z.array(AssistantNextActionSchema).optional(),
  structured_payload: AssistantStructuredPayloadSchema.optional(),
});
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;

// ─── API Response wrappers ────────────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        total: z.number().optional(),
        page: z.number().optional(),
      })
      .optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
