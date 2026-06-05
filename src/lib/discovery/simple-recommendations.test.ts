import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSimpleRecommendations } from "@/lib/discovery/simple-recommendations";
import type { DiscoveryCard } from "@/lib/discovery/types";

function card(
  id: string,
  overrides: Partial<DiscoveryCard> = {},
): DiscoveryCard {
  return {
    business_id: id,
    company_name: `Business ${id}`,
    legal_name: `Business ${id} LLC`,
    dba: null,
    industry: "Wellness",
    metro: "Austin",
    website: null,
    description: null,
    logo_storage_path: null,
    photos: [],
    reputation_score: 4.2,
    ratings_count: 3,
    looking_for: [{ category: "photography", quantity: 1, unit: "projects" }],
    offering: [{ category: "yoga", quantity: 4, unit: "sessions" }],
    primary_looking_for: "photography",
    ...overrides,
  };
}

describe("buildSimpleRecommendations", () => {
  it("returns ranked matches with fit points for demo candidates", () => {
    const focal = card("focal", {
      company_name: "Sunrise Yoga Studio",
      offering: [
        {
          category: "yoga classes",
          quantity: 4,
          unit: "sessions",
          notes: "60-minute yoga classes, 4x/month",
        },
      ],
      looking_for: [
        {
          category: "brand photography",
          quantity: 1,
          unit: "projects",
        },
      ],
    });

    const candidates = [
      card("a", {
        company_name: "Lens & Light Co",
        offering: [
          { category: "brand photography", quantity: 1, unit: "projects" },
        ],
        looking_for: [{ category: "yoga classes", quantity: 4, unit: "sessions" }],
      }),
      card("b", {
        company_name: "Generic Services",
        offering: [{ category: "consulting", quantity: 1, unit: "hours" }],
        looking_for: [{ category: "accounting", quantity: 1, unit: "hours" }],
      }),
    ];

    const result = buildSimpleRecommendations(focal, candidates);

    assert.equal(result.focalBusinessName, "Sunrise Yoga Studio");
    assert.equal(result.matches.length, 2);
    assert.equal(result.matches[0].member.name, "Lens & Light Co");
    assert.ok(result.matches[0].points >= result.matches[1].points);
    assert.ok(result.matches[0].reason.length > 0);
  });

  it("still surfaces partial-fit businesses with a baseline score", () => {
    const focal = card("focal");
    const candidates = [
      card("partial", {
        offering: [{ category: "unrelated", quantity: 1, unit: "hours" }],
        looking_for: [{ category: "other", quantity: 1, unit: "hours" }],
      }),
    ];

    const result = buildSimpleRecommendations(focal, candidates);

    assert.equal(result.matches.length, 1);
    assert.ok(result.matches[0].points >= 40);
  });
});
