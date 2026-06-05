# Reciproca — Design System

> The trust-and-matching network for B2B service trade. Businesses trade the
> services they have for the ones they need, matched by AI, inside a closed,
> vetted network. No trade dollars, no platform currency, no bank.

This repository is the **design system** for Reciproca: the colors, type, tokens,
components, copy voice, and high-fidelity UI kit used to build every Reciproca
screen so they read instantly as **"trust + AI matching, not a 1985 barter site."**

---

## What Reciproca is

Reciproca is a standalone B2B service-trade network. Members list what they
**offer** and what they **need**; an AI matching engine surfaces concrete trade
proposals — including **multi-party clears** (A→B→C→A) that no single pair could
make. Every member is **vetted** before they trade, and every completed trade is
**scored**, building a proprietary vendor-outcome reputation record.

The business positioning, in one line: **vertical + AI + trust + no-currency** —
no incumbent (ITEX, BizX, IMS, Tradebank) holds all four. The design's whole job
is to de-risk the two things that kill this category on sight:

1. **Trust / adverse-selection fear** — the UI makes *Vetted* and *outcome score*
   the loudest signals on every card, so the network reads as curated, not a flea
   market of leftovers.
2. **"Looks like old barter"** — incumbents are all light-mode, dated, accounting
   flavored. A confident **dark base + amber + AI-native match reasoning** signals
   a generation newer.

### The four core screens
- **Landing** — vetted/AI value prop, single amber `Apply to join`, always-visible `Try demo`.
- **Browse Network** — grid of vetted business cards; Vetted badge + amber outcome score are the scannable quality signal.
- **Join** — three segmented form sections, 1-of-3 progress pill, one inline validation error.
- **Matches** *(hero screen)* — match cards with animated amber match-% rings, a glowing Top Match, and a monospaced teal "Why this match" box that reads like live AI output.

Demo seed: **Austin / Wellness vertical** (Sunrise Yoga, Luminary Studio, Verde Social, …).

---

## Sources

This system was built from materials the user provided. The reader may not have
access; they are recorded here for provenance and deeper exploration.

- **GitHub — product codebase & plan:** [`mml555/CursorHackMIA`](https://github.com/mml555/CursorHackMIA)
  - `README.md` — full business plan (market, model, moat, risks).
  - `docs/PRD.md` — MVP product spec: onboarding/vetting, proposal deck (swipe), match→execute→rate flow, data model, key screens.
  - `src/` — Next.js 16 + Clerk + Supabase backend (API routes, validation, trade state machine). **No designed UI** existed in the repo — the page was a Next.js starter — so the visual system here is built from the design plan, not lifted from product code.
- **Design plan** — the decisive design system + per-screen layout + copy lexicon provided directly by the user (Yosef). This is the primary source of truth for tokens, components, and voice.
- **Brand logo** — the official Reciproca interlaced-knot logo ("Trusted Value Exchange"), supplied by the user as an image and processed into `assets/reciproca-mark.png` (transparent) and `assets/reciproca-logo-full.png`.

> Explore the GitHub repository above for the business context and product
> requirements behind these designs.

---

## CONTENT FUNDAMENTALS

How Reciproca writes. Voice = **confident, not loud. Specific over vague.
Precise on money, legal, and trust. Plain professional.**

**Person & address.** Speak to the member as **you** ("the services you have for
the ones you need", "What you trade"). Reciproca refers to itself by name or as
"we" only in process/trust contexts ("We review your profile within 48 hours").

**Tone rules.**
- No exclamation spam. Confidence comes from specificity, not punctuation.
- **No em dashes anywhere.** Use periods or commas.
- Specific beats vague: *"60-minute yoga classes" beats "wellness."*
- Calm on trust. The Vetted badge is quiet, not screaming — "trust is calm."

**Casing.** Sentence case for headlines, buttons, labels, and section titles
("Apply to join", "What you trade", "Member Network"). Not Title Case, not ALL CAPS,
except small mono/eyebrow labels which may use uppercase with letter-spacing
("WHY THIS MATCH").

**Lexicon locks** (use these exact words; they carry legal/trust weight):
- **"vetted"** — never *verified / approved / certified* for the vetting process.
  (The badge word is always **"Vetted"**, never icon-only.)
- **"trade"** is the core verb — never *swap / exchange / barter* in product UI.
  **"barter"** appears in exactly one place: the tax disclaimer.
- **"X% match"** — never *compatible / fit / score* for match strength.
- The phrase **"Trade Dollars" / "TD" never appears.** Reciproca issues no currency.

**No emoji.** Not part of the brand. Trust signals are typographic (the Vetted
pill, the outcome score), never decorative.

**Voice examples (ready to paste).**
- Hero H1: *"Trade the services you have for the ones you need."*
- Subhead: *"Reciproca is a vetted B2B network where businesses trade services directly. AI matching finds your counterpart. No trade dollars, no platform currency, no bank."*
- Value bullets: *"Vetted before you meet" · "AI-matched by fit" · "No platform currency"*
- Vetted tooltip: *"Completed Reciproca's vetting: license check, trade reference, onboarding review."*
- AI reason (Matches): *"Luminary Studio offers brand photography for small businesses and needs weekly wellness sessions for a team of 6. Your class format and their session format match in value and frequency."*
- Tax disclaimer (the only "barter"): *"Barter transactions may be taxable income. Keep records of what you give and receive."*
- Form error: *"We need a valid business email. Personal addresses like Gmail are not accepted for vetting."*
- Empty state: *"We review your profile within 48 hours and surface matches as members join."*

---

## VISUAL FOUNDATIONS

The system is **Mercury (financial trust) meets Linear (AI-native precision),
warmed by amber.** Adjectives: **Credible. Precise. Alive.**

**Logo.** The brand mark is an **interlaced square knot** woven from two teals
(deep `#15414F`, mid `#2E7A8C`) and a **cream** strand (`#ECE3D2`) — two loops
woven into one continuous form, a literal picture of reciprocal exchange. The
wordmark is **"Reciproca"** with the tagline **"Trusted Value Exchange."** On the
dark UI the knot mark sits next to the wordmark rendered in light text
(`#F4F4F2`); the official dark-teal wordmark is reserved for light backgrounds.
Note the deliberate two-color split: the **teal knot is the brand identity**,
while **amber is the action/accent color** in product UI. Teal as AI-reasoning
text is a third, separate role. Files live in `assets/` (`reciproca-mark.png`
transparent, `reciproca-logo-full.png` full lockup). Do not redraw the mark.

**Base & mode.** Dark, always. This is a deliberate differentiator — every
competitor is light-mode and dated. The dark base makes match rings and verified
badges pop, and signals "not that." Background **Ink `#0E0F11`**, cards
**Obsidian `#16181C`**, raised surfaces **`#1E2026`**.

**Color vibe.** Restrained and near-monochrome until a signal needs to speak.
**Amber-gold `#F0A500`** is the single primary accent — CTAs, match rings, the
word "value." **Sage teal `#2DD4AA`** is reserved *exclusively* for AI-reasoning
text — it never becomes a button or a fill, so teal always means "machine is
thinking." **Green `#22C55E`** means vetted/delivered. Warm amber against cool
ink is the whole mood.

**Type.** Inter for all UI and body; **JetBrains Mono only** for AI-reasoning text
and match-% numerals — mono signals "machine output" without decoration. Display
56 / H1 40 / H2 28 / H3 20 / body 15 (lh 1.6) / caption 12. Negative tracking
(-0.02em) on display and H1 for that precise, engineered feel.

**Spacing.** Strict **4px grid**. Card padding 24px. Section gaps 32–48px. Hero
breathing room 96px. Restraint and negative space *are* the credibility signal,
especially on Landing.

**Backgrounds.** Flat Ink. **No stacked gradients** — at most one ~3% amber radial
wash behind the hero or behind the Top Match card. No imagery behind content, no
handshake stock photos, no textures or repeating patterns.

**Corner radii.** tags 6px · inputs & buttons 10px · cards 14px · modals 20px ·
pills full. Consistent and modest — nothing is a balloon.

**Cards.** Obsidian fill, **1px hairline `#2A2D35`** border, 14px radius, 24px
padding. They rest on a soft dark shadow, not a glow. On hover, the border turns
amber and the card lifts slightly.

**Elevation = glow, not drop.** On a dark base, importance is communicated with
light. Cards rest at `0 1px 3px rgba(0,0,0,.4)`. The primary button and the Top
Match card carry an amber glow `0 0 20px rgba(240,165,0,.25)`. Match rings at 85%+
add `0 0 16px rgba(240,165,0,.35)`. Drop shadows are never used to float light
cards — there are no light cards.

**Borders.** Hairline `#2A2D35` everywhere — 1px, quiet. Dividers in forms and
nav use the same hairline. Amber borders appear only on hover/focus and on the
Top Match card.

**Hover states.** Borders go amber; cards lift 1–2px; primary buttons deepen to
`#D49200` and intensify their glow; secondary buttons gain an amber border.
Transitions ~200ms on a standard ease. No bounce.

**Press states.** Subtle — a slight scale-down and the glow softening. Nothing
playful or springy; this is a trust product.

**Focus.** 2px amber ring with 2px offset. Always visible, never removed —
accessibility is part of credibility.

**Transparency & blur.** Used sparingly. The Vetted badge fill is a deep green
`#14532D`. Modal scrims dim the page; nav may use a subtle Ink blur when it
becomes sticky. No frosted-glass overuse.

**Motion.** Purposeful, never decorative. Match-% rings animate (arc draws + number
counts) and stagger on mount — this is the "alive" moment that reads as AI. The
"Why this match" box types in with a blinking ▌ cursor for ~800ms to feel like
live output. Fades and short slides on a standard ease; **no infinite decorative
loops.** Loading uses a **shimmer**, never dead grey boxes.

**Imagery.** Minimal. The brand mark is the real interlaced-knot logo (see Logo,
above). Member logos are simple round monograms (44px) until real ones exist. No
photography of people, no stock. The aesthetic is typographic and structural, not
photographic.

### Hard anti-patterns (never do these)
- No trade-dollar / ledger / balance / "TD" UI of any kind.
- No blue primary button (amber is the only primary).
- No stacked gradients; one ~3% amber radial max.
- No handshake stock photos, no people photography.
- No "73% profile complete" progress bars.
- No numbered pagination — use load-more / infinite scroll.
- Verified is **never** icon-only — always the word "Vetted."
- Loading = shimmer, never dead grey boxes.

---

## ICONOGRAPHY

Reciproca uses a **thin-stroke line-icon** system in the Linear/Lucide family —
~1.5px strokes, rounded joins, no fills. Icons are used **sparingly and
functionally** (search, filter, check, arrow, close, star) and are tinted with
text colors, not amber, except the check inside the Vetted badge and stars in the
rating control.

- **Source:** The product codebase ships no custom icon set (only the default
  Next.js placeholder SVGs, which are not brand assets and were **not** imported).
  This system therefore standardizes on **[Lucide](https://lucide.dev)** —
  CDN-linked — as the closest match to the intended thin-line Linear aesthetic.
  **This is a documented substitution; swap for a bespoke set if one is produced.**
- **Stars** (StarRating) are the one filled glyph: 28px, empty `#2A2D35`, filled
  amber `#F0A500`, left-to-right hover fill.
- **The check** in the Vetted badge is the only icon allowed inside a colored pill.
- **No emoji.** Not used anywhere, ever.
- **No unicode characters as icons**, with one intentional exception: the blinking
  **▌** cursor at the end of the AI-reasoning box (it reinforces "live machine
  output"). Match-% values are real numerals in JetBrains Mono, not glyphs.
- **Brand logo** is the supplied interlaced-knot mark (`assets/reciproca-mark.png`),
  paired with the "Reciproca" wordmark. **Member logos** are rendered as 44px round
  monogram chips (first letter on a tinted surface) until real member logos exist.

See `assets/` for the Reciproca knot mark, the full lockup, and the monogram chip treatment.

---

## Index — what's in this system

| Path | What it is |
|---|---|
| `README.md` | This file — context, content + visual foundations, iconography, index. |
| `colors_and_type.css` | All design tokens as CSS vars (color, type scale, spacing, radius, elevation, motion) + semantic element styles. Import this everywhere. |
| `SKILL.md` | Agent-Skills manifest so this system works as a downloadable Claude skill. |
| `assets/` | Reciproca knot mark + full lockup, plus member monogram chips and any brand imagery. |
| `fonts/` | Note on the webfonts (Inter + JetBrains Mono, loaded via Google Fonts). |
| `preview/` | Small HTML specimen cards that populate the Design System tab (colors, type, spacing, components). |
| `ui_kits/web-app/` | High-fidelity, click-through recreation of the Reciproca web app: Landing, Browse Network, Join, and the Matches hero. JSX components + `index.html`. |

**Start here:** open `ui_kits/web-app/index.html` for the live app, and skim the
`preview/` cards in the Design System tab for the token-level foundations.
