import { z } from "zod";

export const SCRAPE_CONSENT_VERSION = "2026-06-01";

const optionalUrlSchema = z.string().url().optional().or(z.literal(""));

export const employeeCountRangeSchema = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]);

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

export const onboardingSocialSchema = z.object({
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,
  linkedin: optionalUrlSchema,
});

export const onboardingConsentSchema = z.object({
  scrapeConsent: z.literal(true),
  consentVersion: z.literal(SCRAPE_CONSENT_VERSION),
});

function hasCompanyFields(company) {
  return Boolean(
    company?.legalName &&
      company?.metro &&
      company?.industry &&
      company?.employeeCountRange,
  );
}

function hasServices(offers, needs) {
  return Array.isArray(offers) && offers.length > 0 && Array.isArray(needs) && needs.length > 0;
}

function hasConsent(scrapeConsent, consentVersion) {
  return scrapeConsent === true && consentVersion === SCRAPE_CONSENT_VERSION;
}

export function computeMissingFields(draft) {
  const missing = [];
  const company = draft.company ?? {};

  if (!company.legalName) missing.push("legalName");
  if (!company.metro) missing.push("metro");
  if (!company.industry) missing.push("industry");
  if (!company.employeeCountRange) missing.push("employeeCountRange");

  if (!hasServices(draft.offers, draft.needs)) {
    missing.push("offers", "needs");
  }

  if (!hasConsent(draft.scrape_consent, draft.consent_version)) {
    missing.push("scrapeConsent");
  }

  return missing;
}

export function computeStep(draft) {
  if (draft.is_complete) return "complete";

  const company = draft.company ?? {};
  if (!hasCompanyFields(company)) return "company";
  if (!hasServices(draft.offers, draft.needs)) return "services";
  if (!draft.social_step_done) return "social";
  if (!hasConsent(draft.scrape_consent, draft.consent_version)) return "consent";
  return "complete";
}

export function toStatus(draft) {
  const company = draft.company ?? {};
  return {
    step: computeStep(draft),
    isComplete: draft.is_complete,
    missingFields: computeMissingFields(draft),
    profile: {
      legalName: company.legalName,
      dba: company.dba,
      metro: company.metro,
      industry: company.industry,
      employeeCountRange: company.employeeCountRange,
      estimatedCompanyValue: company.estimatedCompanyValue,
      website: company.website,
      description: company.description,
      socialLinks: draft.social_links ?? {},
      scrapeConsent: draft.scrape_consent ?? false,
    },
    offers: draft.offers ?? [],
    needs: draft.needs ?? [],
  };
}
