# Reciproca — Web App UI Kit

A high-fidelity, click-through recreation of the Reciproca web app: the four core
screens that carry the product story. Open **`index.html`** to use it.

## Run it
Open `index.html`. It loads React + Babel from CDN, the shared design tokens
(`tokens.css`), and the kit styles (`app.css`), then mounts the screens.

## Screens (click-through)
- **Landing** — slim 60px headline with bold emphasis, single amber `Apply to join`, always-visible `Try demo`, three value bullets, problem line, and a logo strip of the Austin seed network.
- **Browse Network** — industry filter pills + search, responsive grid of vetted `BusinessCard`s (Vetted badge + amber outcome score as the scannable quality signal), load-more (no pagination).
- **Join** — three segmented form sections (Company / Contact / What you trade), a 1-of-3 progress pill, and one live inline validation error on the services field.
- **Matches** *(hero)* — summary bar, staggered amber match-% rings, a glowing Top Match card, and the organic teal "why this match" reasoning box. Propose → Success flow via a modal.

## Flow
`Landing → Try demo → Matches → Propose a trade → Trade proposed (success)`.
The TopNav `Try demo` and segmented nav let you jump between screens freely.

## Files
| File | Role |
|---|---|
| `index.html` | App shell + screen router. Loads everything. |
| `tokens.css` | Design tokens (copy of the system's `colors_and_type.css`). |
| `app.css` | Component + layout styles for the kit. |
| `primitives.jsx` | Shared parts + seed data: `Mark`, `Button`, `Vetted`, `Stars`, `Chip`, `MatchRing`, `ReasonBox`, icons, `MEMBERS`, `MATCHES`. |
| `TopNav.jsx` | Flat segmented nav with brand badge, live status, Try demo. |
| `Landing.jsx` | Marketing landing screen. |
| `BrowseNetwork.jsx` | Network grid + `BusinessCard`. |
| `Join.jsx` | 3-section application form. |
| `Matches.jsx` | Hero matches screen + `MatchCard`, propose modal, success. |

## Notes
- Components are cosmetic recreations, not production code — interactions are faked.
- The product codebase (`mml555/CursorHackMIA`) shipped no designed UI, so these
  screens realize the design plan rather than copying existing app code.
- Match-% numbers always render their final value (robust for print/PDF); the ring
  arc draws via CSS when motion is allowed.
- Seed cast: Austin / Wellness vertical (Sunrise Yoga, Luminary Studio, Verde Social, …).
