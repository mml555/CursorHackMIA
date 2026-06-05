# Business Plan — [Reciproca]
### The trust-and-matching network for business-to-business service trade
*Working name. Standalone company. v1.0*

**Product spec (MVP):** [docs/PRD.md](docs/PRD.md) — user flows, features, Clerk + Supabase + Vercel stack.

**Run the app:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — Next.js 16, Clerk, Supabase (`npm run dev` from repo root).

> **Reading note:** Every financial figure is an **illustrative model with stated assumptions**, flagged `[MODEL]` — not a claim of fact. Market sizes are `[VERIFIED]` from cited sources (see end).

---

## 1. Executive Summary

**[Reciproca] is the modern operating layer for a $12–14B industry running on 1985 technology: commercial barter.** Businesses everywhere hold idle capacity (empty desks, unsold hours, excess inventory) and need services they would rather not pay cash for. The legacy exchanges (IRTA-member networks like ITEX, BizX, IMS) connect them with a phone rep, a proprietary "trade dollar," and zero quality control. Members trade leftovers and cannot tell a good vendor from a bad one.

[Reciproca] replaces that with three things the incumbents structurally cannot build: **AI multi-party matching** (clears trades no single pair could make), a **closed, vetted network** where vendor quality is tracked as data, and a **software-only model** that avoids issuing a currency and the banking regulation that comes with it.

- **Wedge:** one metro, one service vertical — win density before going wide.
- **Model:** free to browse, subscription for verified access + premium matching, small take-rate only on cash-topup trades.
- **Moat:** proprietary vendor-outcome data that compounds with every trade.
- **Ask (illustrative):** seed round to reach liquidity in the first metro and prove repeatable expansion.

---

## 2. Company Overview

| | |
|---|---|
| **Vision** | The cash economy has Stripe. The trade economy has no one. Build the default rails for businesses to exchange value when cash is the wrong tool. |
| **Mission** | Let any vetted business turn idle capacity into the services it needs, matched by AI, backed by trust. |
| **What we sell** | Access to a curated trade network + AI matching + a verifiable vendor reputation record. |
| **What we are not** | Not a bank, not a currency issuer, not an open classifieds board. |

---

## 3. The Problem

1. **Double-coincidence of wants.** Direct 1:1 barter almost never lines up. Incumbents patched this with a fake currency, which created an accounting and regulatory mess.
2. **Adverse selection.** "Free trade" attracts the capacity nobody will pay cash for. You get leftovers, and no way to judge quality.
3. **Stale technology.** The category is 40 years old. Matching is done by salespeople on the phone. No semantic AI, no outcome data, no modern trust layer.
4. **Cash squeeze on SMEs.** Tight margins push businesses to preserve liquidity, but the existing tools to do so are clunky and low-trust.

---

## 4. The Solution / Product

**Core loop:** List what you offer + need → get vetted in → AI proposes trades → complete trade → both sides scored → reputation follows the vendor.

| Feature | What it does | Why it matters |
|---|---|---|
| **AI multi-party matching** | Clears circular trades (A→B→C→A) when no pair works | Solves the killer problem without a currency |
| **Vendor qualification** | Vetting before entry; closed network | Kills adverse selection; trust is the brand |
| **Outcome scoring** | Every trade rated on actual delivery | Builds the proprietary data moat |
| **Auto-invoicing** | Generates tax-clean records for each side | Removes the legal/accounting friction |
| **Cash-topup** | Uneven trades settle the gap in cash | Monetization without taxing the free hook |

---

## 5. Market Opportunity

> Method: top-down anchors `[VERIFIED]`, then a bottoms-up reality check. Treat TAM as direction, not destiny.

| Layer | Size | Source basis |
|---|---|---|
| **TAM** — global commercial barter trade volume | **$12–14B/yr** total; corporate barter ≈ 30% → **~$4B** | IRTA `[VERIFIED]` |
| **Adjacent TAM** — B2B marketplace platforms | **~$10.6–16B (2025)**, 10–18% CAGR | Business Research Insights / Valuates `[VERIFIED]` |
| **Reference** — B2B services review platforms | **$3.77B (2025) → $7.75B (2034)** | Market Research Future `[VERIFIED]` |
| **SAM** — corporate barter + service-trade in target geographies/verticals | **~$400M–800M** `[MODEL]` | 10–20% of corporate barter reachable digitally |
| **SOM** — realistic 3-yr capture, one+ metros | **$3M–8M revenue** `[MODEL]` | bottoms-up below |

**Bottoms-up reality check (the honest number):** revenue is not GMV. With ~6,000 paying businesses by Y3 at a blended ARPU around $80/mo plus take-rate, you are modeling **~$6–7M ARR** `[MODEL]`. The $4B TAM says the category is real; the bottoms-up says the business is a focused SaaS, not a unicorn on day one.

---

## 6. Competitive Landscape

| Player | Model | Weakness we exploit |
|---|---|---|
| ITEX / BizX / IMS / Tradebank | Legacy barter, trade-dollar, phone reps | No AI, no outcome data, old trust model |
| BarterGrid | AI + blockchain matching | Horizontal, no vertical density, currency/token complexity |
| b2match | NLP B2B matchmaking (events) | Matching only, no trade/trust loop |
| Upwork / Fiverr | Cash freelance marketplaces | Cash-only, no barter, no business-to-business trade |

**Positioning:** *Vertical + AI + trust + no-currency.* No incumbent holds all four. The legacy players cannot drop their trade-dollar without breaking their business; the AI entrants have not gone deep in any single vertical.

---

## 7. Business Model & Pricing

| Stream | Price `[MODEL]` | Logic |
|---|---|---|
| **Free tier** | $0 | Browse + limited matches. The acquisition hook. |
| **Pro subscription** | ~$99/mo per business | Verified badge, unlimited AI matches, priority, analytics |
| **Cash-topup take-rate** | ~5% of the cash portion | Only when a trade is uneven. Does not tax pure trades. |
| **Enterprise/multi-location** | Custom | Chains, franchises, larger operators |

**Why this works:** the thing people show up for (trade) stays free; you charge for **trust and intelligence**, which is what is actually scarce.

---

## 8. Go-To-Market

**Phase 1 — Seed one metro, one vertical (Months 0–6).**
Liquidity is everything. Pick a single metro and a single service-dense vertical. Hand-recruit 50–100 credible businesses. Concierge-match manually while the AI learns. Goal: first 100 completed trades.

**Phase 2 — Density (Months 6–18).**
Saturate that vertical+metro until it is the obvious default there. Turn on self-serve matching. Publish a "verified vendor" standard that becomes locally meaningful. Goal: 300–500 paying businesses, retention > 80%.

**Phase 3 — Expand (Months 18–36).**
Replicate the playbook metro-by-metro, then add a second vertical. Each new market launches warm using the proven recruit-and-seed motion. Goal: multi-metro, ~6,000 paying businesses.

**Acquisition channels:** founder-led direct sales (Phase 1), vertical trade associations/chambers, referral loops (a trade needs two sides, so every user recruits their counterpart), content on "preserve cash / monetize idle capacity."

---

## 9. Unfair Advantages (standalone)

1. **Outcome-data moat.** After thousands of trades, matching quality rests on a private dataset of who-delivers that no new entrant has. Clone the app in a weekend; you cannot clone the data.
2. **Multi-party clearing → no currency → no banking regulation.** Lighter and legal-by-design. Incumbents cannot copy without dismantling their trade-dollar.
3. **Vertical density.** Depth beats breadth in a trust market. Whoever owns one vertical's full graph wins it permanently.
4. **Workflow lock-in.** Reputation, trades, and invoices live in the system. Leaving means losing your track record.

---

## 10. Technology & Operations

| Layer | Approach |
|---|---|
| **Matching engine** | Semantic embeddings of offers/needs + graph solver for circular (multi-party) trades |
| **Trust layer** | Verification at onboarding, post-trade outcome scoring, reputation graph |
| **Platform** | Web app + lightweight mobile; API for partners |
| **Data** | Trade ledger, outcome dataset (the moat), tax-clean invoice records |
| **Ops** | Concierge matching in Phase 1 (humans seed the model), automated by Phase 2 |

---

## 11. Team & Org (hiring plan `[MODEL]`)

| Stage | Roles |
|---|---|
| **Founding** | CEO/founder, technical co-founder (matching + platform), first ops/recruiter |
| **Phase 2** | 2–3 vertical sales, 1 trust/vetting lead, 1 ML engineer |
| **Phase 3** | Per-metro launch leads, customer success, finance/compliance |

---

## 12. Financial Model (3-year, illustrative `[MODEL]`)

> Assumptions: $99/mo Pro ARPU, ~70% of network on Pro by maturity, 5% cash-topup take-rate, blended ARPU ~$80/mo, churn improving 5%→3% monthly.

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Paying businesses (EOY) | ~300 | ~1,500 | ~6,000 |
| Blended ARPU/mo | ~$70 | ~$80 | ~$85 |
| **Revenue** | **~$150K** | **~$1.1M** | **~$5.5–7M** |
| Gross margin | ~70% | ~78% | ~82% |
| Headcount | 4–6 | 10–14 | 25–35 |
| Burn / (profit) | burn | burn | approaching breakeven |

These are planning targets to pressure-test, not forecasts. The sensitivity that matters most: **liquidity/retention in the first vertical.** If it clears, the rest scales; if it does not, no spreadsheet saves it.

---

## 13. Funding Ask & Use of Funds (`[MODEL]`)

**Seed round sized to reach proven liquidity + repeatable expansion (typically 18–24 months runway).**

| Use | Share |
|---|---|
| Product & matching engine | ~40% |
| Go-to-market (vertical sales, seeding) | ~35% |
| Ops, trust/vetting, compliance | ~15% |
| Buffer | ~10% |

**Milestone the round must buy:** proof that a seeded vertical reaches self-sustaining liquidity, and that the playbook repeats in a second market.

---

## 14. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Cold-start / no liquidity** | Critical | Concierge-seed one metro+vertical; founder-led recruiting; do not go wide until dense |
| Adverse selection (leftovers) | High | Closed vetted network; outcome scoring gates re-matching |
| Tax/legal (barter is taxable income) | Med | Auto tax-clean invoices; software-only, no currency = no money-transmitter exposure |
| Incumbent response | Med | They cannot drop their trade-dollar; you out-vertical them |
| Monetization vs free hook | Med | Charge trust/intelligence, not the trade |
| **Demand beyond seed network** | High/unknown | Empirical — the 30-day test before scaling spend |

---

## 15. Roadmap / Milestones

| Quarter | Milestone |
|---|---|
| Q1 | MVP matching + vetting; recruit first 50 businesses; first 10 trades |
| Q2 | 100 trades completed; concierge → semi-automated; pricing live |
| Q3–Q4 | 300 paying; retention >80%; vertical "verified" standard adopted |
| Y2 | Self-serve matching; 2nd metro; 1,500 paying |
| Y3 | 2nd vertical; multi-metro; ~6,000 paying; near breakeven |

---

## 16. KPIs

- **North star:** completed trades per active business per month.
- Liquidity: % of listed needs matched within 14 days.
- Trust: average outcome score; % repeat trades.
- Growth: paying businesses, net revenue retention.
- Health: match-to-completion rate, churn, CAC payback.

---

## 17. Vision / Exit

Become the system of record for non-cash business value exchange — start in one vertical, become horizontal by stacking verticals you already own. Exit paths: strategic acquisition by a B2B marketplace/fintech, or a fintech adjacency (the trade ledger + invoicing is a payments wedge).

---

## The one honest flag

The entire plan rests on a single unproven assumption: **that demand clears outside a seeded network.** Everything else is execution. Do not let the polish of this document hide that one bet. Run the cheapest possible 30-day liquidity test before scaling spend.

---

## Sources (market grounding)

- [IRTA — Barter & Trade Industry](https://www.irta.com/about/the-barter-and-trade-industry/) — $12–14B industry, composition split
- [B2B Marketplace Platforms Market](https://www.businessresearchinsights.com/market-reports/b2b-marketplace-platforms-market-118215)
- [B2B Marketplace forecast (Valuates)](https://finance.yahoo.com/news/b2b-marketplace-platforms-market-reach-152400702.html)
- [B2B Services Review Platform Market](https://www.marketresearchfuture.com/reports/b2b-services-review-platform-market-31798)
- [Freelance / B2B SaaS market context (Mordor)](https://www.mordorintelligence.com/industry-reports/b2b-saas-market)
