import { z } from "zod";

export const employeeCountRangeSchema = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]);

export const onboardingStepSchema = z.enum([
  "company",
  "services",
  "social",
  "consent",
  "complete",
]);

const optionalUrlSchema = z
  .string()
  .url()
  .optional()
  .or(z.literal(""));

export const socialLinksSchema = z.object({
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,
  linkedin: optionalUrlSchema,
});

export const onboardingServiceLineSchema = z.object({
  category: z.string().min(1).max(100),
  unit: z.string().min(1).max(50),
  quantity: z.number().positive().default(1),
  fmvEstimate: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export const onboardingCompanySchema = z.object({
  legalName: z.string().min(1).max(200),
  dba: z.string().max(200).optional(),
  metro: z.string().min(1).max(100),
  industry: z.string().min(1).max(100),
  employeeCountRange: employeeCountRangeSchema,
  estimatedCompanyValue: z.number().nonnegative().optional(),
  website: optionalUrlSchema,
  description: z.string().max(2000).optional(),
});

export const onboardingServicesSchema = z.object({
  offers: z.array(onboardingServiceLineSchema).min(1).max(20),
  needs: z.array(onboardingServiceLineSchema).min(1).max(20),
});

export const onboardingSocialSchema = socialLinksSchema;

export const SCRAPE_CONSENT_VERSION = "2026-06-01";

export const onboardingConsentSchema = z.object({
  scrapeConsent: z.literal(true),
  consentVersion: z.literal(SCRAPE_CONSENT_VERSION),
});

export type OnboardingStep = z.infer<typeof onboardingStepSchema>;
export type OnboardingCompanyInput = z.infer<typeof onboardingCompanySchema>;
export type OnboardingServicesInput = z.infer<typeof onboardingServicesSchema>;
export type OnboardingSocialInput = z.infer<typeof onboardingSocialSchema>;
export type OnboardingConsentInput = z.infer<typeof onboardingConsentSchema>;
export type OnboardingServiceLineInput = z.infer<
  typeof onboardingServiceLineSchema
>;

export type OnboardingStatus = {
  step: OnboardingStep;
  isComplete: boolean;
  missingFields: string[];
  profile: {
    legalName?: string;
    dba?: string;
    metro?: string;
    industry?: string;
    employeeCountRange?: string;
    estimatedCompanyValue?: number;
    website?: string;
    description?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
    scrapeConsent?: boolean;
  } | null;
  offers: OnboardingServiceLineInput[];
  needs: OnboardingServiceLineInput[];
};

export const EMPLOYEE_COUNT_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
] as const;

export const ONBOARDING_STEPS = [
  { id: "company" as const, label: "Company", href: "/onboarding/company" },
  { id: "services" as const, label: "Services", href: "/onboarding/services" },
  { id: "social" as const, label: "Social", href: "/onboarding/social" },
  { id: "consent" as const, label: "Consent", href: "/onboarding/consent" },
  { id: "complete" as const, label: "Review", href: "/onboarding/complete" },
];

export function stepHref(step: OnboardingStep): string {
  return ONBOARDING_STEPS.find((item) => item.id === step)?.href ?? "/onboarding/company";
}
