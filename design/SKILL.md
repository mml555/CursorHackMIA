---
name: reciproca-design
description: Use this skill to generate well-branded interfaces and assets for Reciproca, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Reciproca is a vetted B2B service-trade network (trade services without cash, matched
by AI, with vendor outcome scores). The design system is dark-based, Mercury + Linear
in spirit, warmed by amber. Key files:

- `README.md` — full context, content + visual foundations, iconography, index.
- `colors_and_type.css` — all design tokens (color, type, spacing, radius, elevation, motion) + semantic styles. Import this in any artifact.
- `assets/` — the real Reciproca knot logo (`reciproca-mark.png`, `reciproca-logo-full.png`).
- `fonts/` — Inter + JetBrains Mono (Google Fonts).
- `preview/` — specimen cards for every token and component.
- `ui_kits/web-app/` — high-fidelity, click-through recreation of the app (Landing, Browse Network, Join, Matches). Reuse its JSX components and styles.

Non-negotiables when designing for Reciproca:
- Dark base (Ink `#0E0F11`). Amber `#F0A500` is the only primary/action accent.
- Teal `#2DD4AA` is ONLY for AI-reasoning text. Green `#22C55E` means vetted/delivered.
- Inter for UI; JetBrains Mono only for AI-reasoning text and match-% numerals.
- The teal knot logo is brand identity; amber is the action color; do not redraw the mark.
- Voice: confident, plain, no exclamation spam, no em dashes. Use "vetted" (not verified), "trade" as the verb, "barter" only in the tax disclaimer. "X% match". Never "trade dollars".
- Avoid: blue primary, ledger/trade-dollar UI, handshake stock photos, stacked gradients (one ~3% amber radial max), numbered pagination, icon-only verified badges, dead grey loading boxes.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts or production code, depending on the need.
