# Reciproca — Build & Integration Plan

A step-by-step sequence for building the product, ordered so each step depends only on the ones before it. The order is not arbitrary: it mirrors the go-to-market phases in the business plan and is shaped by the plan's "one honest flag" — the whole thing rests on proving that demand clears outside a seeded network. Everything here is designed to get you to that proof as cheaply as possible, then build outward only once it holds.

## Three principles that drive the order

**1. Liquidity before features.** The cheapest way to test the core bet is humans matching trades by hand, not an AI matching engine. So the early build makes a *concierge* productive — it does not automate matching. You reach the first 100 trades with a console and a phone, not a graph solver.

**2. The moat accrues from trade #1.** Defensibility comes from proprietary outcome data (who actually delivers). That dataset has to be captured as structured records and raw text from the very first manual trade, so the matching model can be trained later and the reputation graph compounds from the start. You cannot retrofit this.

**3. Build in GTM order.** Product phases map to the plan's GTM phases. The headline feature — multi-party circular clearing — is a Phase 3 capability and is worthless without density. Building it before you have liquidity in one vertical would be the classic mistake.

## Cross-cutting concerns (true throughout)

These are not steps; they apply to every step. Stay software-only with no issued currency or held member balances — that is what keeps you out of money-transmitter territory, so any payment handling (Steps 8–9) routes cash directly between parties via a processor, never into a Reciproca-controlled trade balance. Treat barter as taxable from day one (every completed trade needs a fair-market-value record). Capture raw listing text and structured outcome data on every trade even before the AI uses them. Keep the vertical taxonomy a single source of truth, since matching, invoicing, and analytics all read from it.

---

## Phase 1 — Concierge MVP (Months 0–6): get to 100 trades by hand

### Step 0 — Data schema and account foundation
**Build:** the core entities everything else reads and writes — Business, User, Membership/role, Listing (typed `offer` or `need`, with structured category fields, a fair-market-value field, and a free-text description), Match, Trade (state machine: `proposed → accepted → in_progress → completed → disputed`), OutcomeScore, Invoice, and an embeddings table left empty for now. Plus auth and two roles: member and admin/concierge.
**Depends on:** nothing — this is the spine.
**Why now:** every later step hangs on these tables. Designing the trade ledger and outcome schema *now*, before any matching exists, is precisely what lets the moat accrue while matching is still manual.
**Done when:** a concierge can manually create a business, a listing, a trade, and a score through the admin interface.

### Step 1 — Onboarding and vetting workflow
**Build:** public signup and an application form that captures what the business offers and needs; a vetting queue in the admin console; approve/reject actions; a `verified` status flag on the business.
**Depends on:** Step 0.
**Why now:** the closed, vetted network is what kills adverse selection and is the brand. You cannot seed quality supply without a gate at the door.
**Done when:** a business can apply, a reviewer can vet and admit or reject them, and verified status is visible.

### Step 2 — Listing capture (structured offers and needs)
**Build:** member-facing forms to post and edit offers and needs; the category taxonomy for your one chosen vertical; the fair-market-value field (needed later for tax-clean invoicing); storage of the raw free text so embeddings can be computed retroactively.
**Depends on:** Steps 0–1.
**Why now:** matching has nothing to work with until supply and demand are captured in a structured way — and storing the text now means the AI in Step 6 can learn from history rather than starting cold.
**Done when:** vetted members can post and edit offers and needs, and the concierge can see all of them.

### Step 3 — Concierge matching console and trade ledger
**Build:** an internal tool to search and filter listings, propose a match, notify both sides, record each side's acceptance, and advance the trade through its states to completion. This is the Phase 1 "engine" — a human, not an algorithm.
**Depends on:** Steps 0–2.
**Why now:** this is where the first 100 trades actually happen while the model is still dumb. It is the minimum machinery to run the business manually.
**Done when:** a concierge can take two listings, propose a match, get both sides to accept, and mark the trade complete — all fully logged.

### Step 4 — Outcome scoring (the moat begins)
**Build:** a post-completion step where both sides rate actual delivery; a structured outcome record linked to the trade and to each vendor.
**Depends on:** Step 3.
**Why now:** this proprietary dataset is the entire defensibility argument. It must start with trade #1.
**Done when:** every completed trade produces a two-sided outcome score stored against the vendors.

### Step 5 — Basic invoicing (tax-clean records)
**Build:** generation of a record for each side stating the fair-market value exchanged, since barter is taxable income. Templated/manual is fine at this stage.
**Depends on:** Step 3 plus the FMV field from Step 2.
**Why now:** removing the accounting and legal friction is what makes businesses comfortable trading at all, and you want it in place before asking anyone to pay or scaling spend.
**Done when:** each completed trade emits a downloadable record for both sides.

> ### ⛔ Gate: run the 30-day liquidity test
> Steps 0–5 are the cheapest possible version of the whole bet. Seed one metro and one vertical, hand-recruit 50–100 credible businesses, and concierge-match them. **Do not build anything below this line until a seeded vertical shows that listed needs actually clear.** This is the plan's one honest flag — if demand does not clear here, no further engineering saves it.

---

## Phase 2 — Semi-automated and monetized (Months 6–18)

### Step 6 — Semantic match suggestions (assistive AI)
**Build:** compute embeddings of the offer/need text accumulated since Step 2; surface ranked candidate matches — first to the concierge as suggestions (human in the loop), then to members. Track suggestion acceptance rate.
**Depends on:** Steps 2–4 and a meaningful volume of real listings plus the proof of liquidity from the gate.
**Why now:** this only pays off once there is real listing volume and you know the market clears. It begins the shift from manual to semi-automated matching.
**Done when:** the concierge sees AI-suggested matches and their acceptance rate is being measured.

### Step 7 — Reputation graph (make the trust data a feature)
**Build:** aggregate the outcome scores from Step 4 into a per-vendor reputation; display it on profiles; feed it into match ranking so low-scoring vendors are deprioritized for re-matching.
**Depends on:** Step 4 (accumulated scores) and Step 6 (ranking surface).
**Why now:** the data already exists; this turns it into a visible product feature and a matching input. Trust is what you will actually charge for, so it has to be real before the paywall.
**Done when:** each vendor shows a reputation on their profile and it measurably affects match ranking.

### Step 8 — Subscription billing (Pro tier)
**Build:** payment processor integration; free-vs-Pro feature gating (verified badge, unlimited AI matches, analytics, priority); recurring billing at the ~$99/mo Pro price.
**Depends on:** Steps 6–7 — there must be something worth paying for first.
**Why now:** you monetize trust and intelligence, not the trade itself, so the paywall comes only after matching and reputation exist and after liquidity is proven.
**Done when:** a business can subscribe, unlock Pro features, and be billed on a recurring basis.

### Step 9 — Cash-topup settlement and take-rate
**Build:** let uneven trades settle the cash gap; capture roughly a 5% take on the cash portion only; route that cash directly between parties through the processor — never into a platform-held balance, to stay software-only.
**Depends on:** Step 8 (payment rails) and Step 3 (trade flow).
**Why now:** this monetizes uneven trades without taxing pure trades, and it needs both the trade engine and the payment integration in place.
**Done when:** an uneven trade can settle a cash delta and the platform captures its percentage.

### Step 10 — Self-serve automated matching and member analytics
**Build:** promote the Step 6 suggestions from concierge-only to member-facing self-serve; ship a member dashboard with the core KPIs (matches, completion rate, reputation).
**Depends on:** Step 6 reaching an acceptable acceptance-rate threshold, and Step 8 (analytics is a Pro feature).
**Why now:** this is the Phase 2 "turn on self-serve" milestone, and it is only safe once the model has learned enough from concierge data to match without a human.
**Done when:** members match without a human in the loop at acceptable quality, and analytics are live.

---

## Phase 3 — Multi-party clearing and scale (Months 18–36)

### Step 11 — Multi-party / circular clearing (the headline feature)
**Build:** a graph solver over the offer/need graph that clears circular trades (A→B→C→A) no single pair could make — cycle detection / min-cost-flow over the demand graph — and proposes the multi-leg trade with coordinated, multi-party execution.
**Depends on:** dense single-vertical liquidity, a working pairwise engine (Step 6/10), and reliable multi-party trade execution built on the Step 3 state machine.
**Why now:** this solves the category's killer problem, but it is worthless without density. Build it once one vertical is genuinely saturated.
**Done when:** the system proposes and executes a three-party trade end to end.

### Step 12 — Multi-tenancy: new metros and a second vertical
**Build:** geo/vertical segmentation so each market has its own liquidity pool and its own "verified" standard; per-metro launch tooling to replicate the seed playbook.
**Depends on:** a proven, repeatable seeding playbook from market #1.
**Why now:** Phase 3 expansion replicates only what is already proven; isolating liquidity per market prevents diluting density.
**Done when:** a second metro or vertical runs on the same stack with its own isolated liquidity pool.

### Step 13 — Enterprise, API, and mobile
**Build:** custom multi-location accounts for chains and franchises; a partner API; a lightweight mobile client.
**Depends on:** a stable, proven core across all prior steps.
**Why now:** this is expansion surface area for larger customers and partners — valuable, but only after the core engine works and repeats.
**Done when:** an enterprise account with multiple locations, an external API consumer, and mobile access all function.

---

## Critical path at a glance

The hard dependency chain is: **schema (0) → vetting (1) → listings (2) → concierge console + ledger (3) → outcome scoring (4) → invoicing (5) → [LIQUIDITY GATE] → embeddings (6) → reputation (7) → billing (8) → cash-topup (9) → self-serve (10) → multi-party clearing (11) → multi-tenancy (12) → enterprise/API/mobile (13).**

Two things are easy to get wrong. First, do not let the polish of the AI features tempt you to build the matching engine (Step 6) or the multi-party solver (Step 11) before the concierge phase has proven liquidity — that ordering inversion is the most expensive mistake available. Second, Steps 4 and 5 (outcome capture and FMV records) feel skippable in an MVP and are not: they are the moat and the legal cover respectively, and both are far cheaper to build in than to retrofit.

Throughout, the number that tells you whether to keep going is the plan's north star — **completed trades per active business per month** — backed by the share of listed needs matched within 14 days. If those hold in the seeded vertical, the steps above scale. If they do not, stop at the gate.
