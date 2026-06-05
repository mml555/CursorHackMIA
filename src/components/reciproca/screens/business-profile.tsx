"use client";

import { useEffect, useState } from "react";
import {
  expressDiscoveryInterest,
  fetchBusinessProfile,
} from "@/lib/discovery/browser-client";
import type { BusinessProfile } from "@/lib/discovery/types";
import type { DiscoveryListing } from "@/lib/discovery/types";
import { ProposeModal } from "../propose-modal";
import type { Member, Navigate, Screen } from "../types";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  IconArrow,
  SkeletonCard,
  Stars,
  Vetted,
} from "../primitives";

function formatListingQuantity(listing: DiscoveryListing): string {
  if (listing.unit === "sessions" && listing.quantity > 0) {
    return `${listing.quantity}x/month`;
  }
  if (listing.unit === "months" && listing.quantity > 0) {
    return `${listing.quantity} months`;
  }
  if (listing.unit === "hours" && listing.quantity > 0) {
    return `${listing.quantity} hours`;
  }
  if (listing.quantity > 0) {
    return `${listing.quantity} ${listing.unit}`;
  }
  return "";
}

function ListingSection({
  title,
  listings,
  emptyLabel,
}: {
  title: string;
  listings: DiscoveryListing[];
  emptyLabel: string;
}) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">{title}</h2>
      {listings.length === 0 ? (
        <p className="muted profile-empty">{emptyLabel}</p>
      ) : (
        <ul className="profile-listings">
          {listings.map((listing) => {
            const qty = formatListingQuantity(listing);
            return (
              <li key={listing.id} className="profile-listing">
                <div className="profile-listing-main">
                  <span className="profile-listing-cat">{listing.category}</span>
                  {qty && <span className="profile-listing-qty">{qty}</span>}
                </div>
                {listing.notes?.trim() && (
                  <p className="profile-listing-notes">{listing.notes.trim()}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function profileToMember(profile: BusinessProfile): Member {
  return {
    id: profile.id,
    name: profile.name,
    industry: profile.industry,
    trading: profile.trading,
    looking: profile.looking,
    score: profile.score,
    trades: profile.trades,
  };
}

const RETURN_LABELS: Partial<Record<Screen, string>> = {
  network: "Back to network",
  matches: "Back to matches",
};

export function BusinessProfileScreen({
  businessId,
  returnTo = "network",
  go,
  offeringDefault,
}: {
  businessId: string;
  returnTo?: Screen;
  go: Navigate;
  offeringDefault?: string;
}) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showPropose, setShowPropose] = useState(false);
  const [proposeSent, setProposeSent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchBusinessProfile(businessId);
        if (!cancelled) {
          if (!data?.id) {
            setProfile(null);
            setError("Business not found");
          } else {
            setProfile(data);
            setError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load business profile",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [businessId, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <div className="profile-back">
          <Button variant="ghost" size="sm" onClick={() => go(returnTo)}>
            <span className="profile-back-arrow" aria-hidden="true">
              <IconArrow size={14} />
            </span>
            {RETURN_LABELS[returnTo] ?? "Back"}
          </Button>
        </div>

        {loading && (
          <div className="profile-layout" aria-busy="true">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && <ErrorState message={error} onRetry={retry} />}

        {!loading && !error && !profile && (
          <EmptyState
            title="Business not found"
            message="This profile may have been removed or is no longer available in the network."
            actionLabel={RETURN_LABELS[returnTo] ?? "Go back"}
            onAction={() => go(returnTo)}
          />
        )}

        {!loading && !error && profile && (
          <div className="profile-layout">
            <div className="profile-main">
              <div className="card profile-hero">
                <div className="profile-hero-top">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={`${profile.name} logo`}
                      className="profile-logo"
                      width={72}
                      height={72}
                    />
                  ) : (
                    <Chip name={profile.name} size={72} />
                  )}
                  <div className="profile-hero-copy">
                    <h1 className="profile-name">
                      {profile.name} <Vetted />
                    </h1>
                    <div className="profile-meta">
                      <span className="tag">{profile.industry}</span>
                      {profile.metro && (
                        <span className="profile-metro">{profile.metro}</span>
                      )}
                    </div>
                    {profile.dba && profile.dba !== profile.name && (
                      <p className="profile-legal muted">
                        Legal: {profile.legalName}
                        {profile.dba ? ` · DBA ${profile.dba}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="profile-score">
                  <span>
                    Outcome score {profile.score.toFixed(1)} · {profile.trades}{" "}
                    trades
                  </span>
                  <Stars value={profile.score} />
                </div>

                {profile.description?.trim() && (
                  <p className="profile-description">{profile.description.trim()}</p>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-website"
                  >
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}

                {proposeSent && (
                  <p className="profile-sent muted" role="status">
                    Interest recorded. A trade proposal will follow mutual review.
                  </p>
                )}

                <div className="profile-actions">
                  <Button variant="primary" onClick={() => setShowPropose(true)}>
                    Propose a trade
                  </Button>
                  <Button variant="secondary" onClick={() => go("matches")}>
                    View your matches
                  </Button>
                </div>
              </div>

              <ListingSection
                title="What they offer"
                listings={profile.offering}
                emptyLabel="No active offers listed yet."
              />
              <ListingSection
                title="What they need"
                listings={profile.lookingFor}
                emptyLabel="No active needs listed yet."
              />
            </div>

            {profile.photos.length > 0 && (
              <aside className="profile-gallery card">
                <h2 className="profile-section-title">Gallery</h2>
                <div className="profile-photos">
                  {profile.photos.map((photo) => (
                    <figure key={photo.id} className="profile-photo">
                      <img
                        src={photo.public_url}
                        alt={photo.caption?.trim() || `${profile.name} photo`}
                        loading="lazy"
                      />
                      {photo.caption?.trim() && (
                        <figcaption>{photo.caption.trim()}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      {showPropose && profile && (
        <ProposeModal
          member={profileToMember(profile)}
          offeringDefault={offeringDefault}
          onClose={() => setShowPropose(false)}
          onSend={async () => {
            await expressDiscoveryInterest(profile.id);
            setShowPropose(false);
            setProposeSent(true);
          }}
        />
      )}
    </div>
  );
}
