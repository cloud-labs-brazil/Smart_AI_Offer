# Theme System

## Overview

The theme system provides 5 visual modes that dynamically change colors, typography, spacing, and chart palettes via CSS variables. Theme selection persists to `localStorage`.

## Available Themes

| Theme | Font | Style |
|-------|------|-------|
| McKinsey Minimal | Inter | Clean, corporate white |
| CFO Dark Premium | Outfit | Dark, gold accents |
| Big Tech SaaS | Plus Jakarta Sans | Modern indigo |
| War Room Mode | JetBrains Mono | Terminal green-on-black |
| Institutional Clean | Roboto | Standard blue |

## Token Structure

Each theme JSON contains:

```json
{
  "name": "Theme Name",
  "tokens": {
    "colors": {
      "bg", "surface", "text", "muted", "primary",
      "accent", "border", "danger", "warning", "success"
    },
    "fontFamily": "Google Font Name",
    "chartSeries": ["#color1", "#color2", "..."],
    "typography": {
      "fontSans", "weightNormal", "weightBold", "letterSpacing"
    },
    "spacing": { "cardPadding", "gap" },
    "radius": "CSS border-radius",
    "shadow": "CSS box-shadow"
  }
}
```

## CSS Variables Generated

| Variable | Source |
|----------|--------|
| `--color-{key}` | `tokens.colors.*` |
| `--chart-{0-5}` | `tokens.chartSeries[i]` |
| `--font-family` | `tokens.fontFamily` |
| `--radius-card` | `tokens.radius` |
| `--shadow-card` | `tokens.shadow` |
| `--font-weight-normal` | `tokens.typography.weightNormal` |
| `--font-weight-bold` | `tokens.typography.weightBold` |
| `--letter-spacing` | `tokens.typography.letterSpacing` |
| `--card-padding` | `tokens.spacing.cardPadding` |
| `--grid-gap` | `tokens.spacing.gap` |

## Persistence

- Theme selection is saved to `localStorage` under key `rsa-theme`.
- On page load, the store reads from `localStorage` (SSR-safe).
- Falls back to "McKinsey Minimal" if no saved value exists.

## Google Fonts

Fonts are loaded lazily via `<link>` injection in `ThemeProvider.tsx`:
- Only loaded once per font family per session.
- Does not block initial render.
- Loaded from `fonts.googleapis.com` CDN.

## Adding a New Theme

1. Create a new JSON file in `themes/` following the token structure above.
2. Import it in `store/themeStore.ts` and add to the `themes` record.
3. Add the Google Font URL to `GOOGLE_FONTS` in `ThemeProvider.tsx`.
