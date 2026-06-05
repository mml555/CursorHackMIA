# Fonts

Reciproca uses two typefaces, both free and on Google Fonts:

- **Inter** — all UI and body text. Weights used: 400, 500, 600, 700.
- **JetBrains Mono** — AI-reasoning text and match-% numerals ONLY. Weights: 400, 500.

## How they are loaded

`colors_and_type.css` imports both from the Google Fonts CDN:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

This keeps the system lightweight and always current. **No local font files are
committed** — if you need a fully offline / self-hosted build (e.g. a downloaded
skill with no network), download the woff2 files from Google Fonts and drop them
in this folder, then replace the `@import` with `@font-face` rules pointing here.

> Substitution note: these are the exact specified typefaces, not substitutes.
