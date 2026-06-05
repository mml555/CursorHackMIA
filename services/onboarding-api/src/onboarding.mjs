import { createClient } from "@supabase/supabase-js";
import {
  computeMissingFields,
  computeStep,
  toStatus,
} from "./schemas.mjs";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function createSupabase(url, serviceRoleKey) {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getProfileByClerkId(supabase, clerkUserId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getOrCreateDraft(supabase, profileId) {
  const { data: existing, error: readError } = await supabase
    .from("onboarding_drafts")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("onboarding_drafts")
    .insert({ profile_id: profileId })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

async function saveDraft(supabase, draftId, currentDraft, patch) {
  const merged = { ...currentDraft, ...patch };
  const missing_fields = computeMissingFields(merged);
  const step = computeStep(merged);

  const { data, error } = await supabase
    .from("onboarding_drafts")
    .update({
      ...patch,
      step,
      missing_fields,
    })
    .eq("id", draftId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function finalizeOnboarding(supabase, profile, draft) {
  const { data: existingMembership } = await supabase
    .from("business_members")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existingMembership) {
    const error = new Error("User already belongs to a business");
    error.status = 409;
    error.code = "ALREADY_ONBOARDED";
    throw error;
  }

  const company = draft.company ?? {};
  const baseSlug = slugify(company.dba || company.legalName || "business");
  const slug = `${baseSlug}-${profile.id.slice(0, 8)}`;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      legal_name: company.legalName,
      dba: company.dba ?? null,
      slug,
      metro: company.metro,
      vertical: company.industry,
      website: company.website || null,
      description: company.description ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (businessError) throw businessError;

  const { error: memberError } = await supabase.from("business_members").insert({
    profile_id: profile.id,
    business_id: business.id,
    role: "owner",
  });

  if (memberError) throw memberError;

  const listingRows = [
    ...(draft.offers ?? []).map((line) => ({
      business_id: business.id,
      listing_type: "offer",
      category: line.category,
      unit: line.unit,
      quantity: line.quantity ?? 1,
      fmv_estimate: line.fmvEstimate ?? null,
      notes: line.notes ?? null,
      is_active: true,
    })),
    ...(draft.needs ?? []).map((line) => ({
      business_id: business.id,
      listing_type: "need",
      category: line.category,
      unit: line.unit,
      quantity: line.quantity ?? 1,
      fmv_estimate: line.fmvEstimate ?? null,
      notes: line.notes ?? null,
      is_active: true,
    })),
  ];

  if (listingRows.length > 0) {
    const { error: listingsError } = await supabase
      .from("listings")
      .insert(listingRows);

    if (listingsError) throw listingsError;
  }

  return business;
}

export function createOnboardingService({ supabaseUrl, supabaseServiceRoleKey }) {
  const supabase = createSupabase(supabaseUrl, supabaseServiceRoleKey);

  async function requireProfile(clerkUserId) {
    const profile = await getProfileByClerkId(supabase, clerkUserId);
    if (!profile) {
      const error = new Error(
        "Profile not found. Wait for account sync or sign in again.",
      );
      error.status = 403;
      error.code = "PROFILE_NOT_FOUND";
      throw error;
    }
    return profile;
  }

  return {
    async getStatus(clerkUserId) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      return toStatus(draft);
    },

    async saveCompany(clerkUserId, input) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      const updated = await saveDraft(supabase, draft.id, draft, {
        company: input,
      });
      return toStatus(updated);
    },

    async saveServices(clerkUserId, input) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      const updated = await saveDraft(supabase, draft.id, draft, {
        offers: input.offers,
        needs: input.needs,
      });
      return toStatus(updated);
    },

    async saveSocial(clerkUserId, input) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      const updated = await saveDraft(supabase, draft.id, draft, {
        social_links: input,
        social_step_done: true,
      });
      return toStatus(updated);
    },

    async saveConsent(clerkUserId, input) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      const updated = await saveDraft(supabase, draft.id, draft, {
        scrape_consent: true,
        consent_version: input.consentVersion,
      });
      return toStatus(updated);
    },

    async complete(clerkUserId) {
      const profile = await requireProfile(clerkUserId);
      const draft = await getOrCreateDraft(supabase, profile.id);
      const missing = computeMissingFields(draft);

      if (missing.length > 0) {
        const error = new Error("Onboarding is incomplete");
        error.status = 422;
        error.code = "ONBOARDING_INCOMPLETE";
        error.details = { missingFields: missing };
        throw error;
      }

      if (!draft.is_complete) {
        await finalizeOnboarding(supabase, profile, draft);
      }

      const updated = await saveDraft(supabase, draft.id, draft, {
        is_complete: true,
        step: "complete",
      });

      return toStatus(updated);
    },
  };
}
