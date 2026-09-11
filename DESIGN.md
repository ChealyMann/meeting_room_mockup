---
name: Cafe
colors:
  primary: "#991B1B"
  primary-hover: "#7F1D1D"
  primary-active: "#691515"
  secondary: "#E9E3DD"
  accent: "#D97706"
  sidebar: "#260707"
  sidebar-border: "#3D0C0C"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  canvas: "#F9F7F5"
  surface: "#FFFFFF"
  border: "#E9E3DD"
  text: "#1C1917"
  text-secondary: "#57534E"
  text-muted: "#78716C"
typography:
  h1:
    fontFamily: "Poppins"
    fontSize: 2.25rem
  h2:
    fontFamily: "Poppins"
    fontSize: 1.5rem
  h3:
    fontFamily: "Poppins"
    fontSize: 1.125rem
  body-md:
    fontFamily: "Poppins"
    fontSize: 0.875rem
  body-sm:
    fontFamily: "Poppins"
    fontSize: 0.75rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "expressive humanistic scale"
  weights: "300, 400, 500, 600, 700, 800"
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 16px
  full: 9999px
spacing:
  2xs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  3xl: 48px
  sourceScale: "2/4/8/12/16/24/32/48"
---

# TypeUI Cafe Design System (with NBC Crimson Sidebar Heritage)

## Overview

A cozy, warm, and handcrafted aesthetic inspired by artisan coffee counters and hospitality spaces, fused seamlessly with the stately National Bank of Cambodia dark crimson red sidebar heritage. It balances approachable organic coffee warmth with executive banking precision.

## Style Foundations

- **Visual Style**: Warm, inviting, cozy cafe-inspired interface with warm tones, soft typography, tactile micro-interactions, and clean layouts for a relaxed browsing experience.
- **Typography Scale**:
  - Primary & Display: `Poppins`, sans-serif (weights: 300, 400, 500, 600, 700, 800)
  - Khmer Script: `Kantumruy Pro`, sans-serif (weights: 400, 500, 600, 700)
  - Monospace / Metrics: `JetBrains Mono`, monospace (weights: 400, 500, 600, 700)
- **Surfaces**:
  - Global Canvas: Soft Warm Cafe Surface `#F9F7F5` / `#F5F2EE` (`--bg-app`)
  - Cards & Panels: Warm Crisp White `#FFFFFF` (`--bg-card`) with hairline stroke `1px solid #E9E3DD`
  - Subtle Surface: Soft Oat Cream `#FAF7F4` / `#F4EFEA` (`--bg-card-subtle`)
  - Sidebar: Rich NBC Dark Crimson/Burgundy `#260707` / `#2A0808` with borders `#3D0C0C` / `#450A0A`
- **Color Palette**:
  - **Primary (#991B1B):** NBC Crimson Red for primary buttons, active tabs, key highlights (hover: `#7F1D1D`, active: `#691515`).
  - **Secondary (#E9E3DD):** Warm oat milk/cream for hairline borders, subtle chip tracks, soft pills.
  - **Accent / Gold (#D97706 / #FACC15):** Warm artisan caramel amber for highlights, badges, ratings, and special features.
  - **NBC Crimson Heritage (#991B1B):** Bank heritage red for official executive seals, approval stamps, and sidebar active indicators.
  - **Success (#16A34A):** Organic emerald green for available status and booking confirmations.
  - **Warning (#D97706):** Spiced amber for pending reviews and reservation warnings.
  - **Danger (#DC2626):** Crimson red for occupied status and rejection notices.
  - **Text Primary (#1C1917):** Deep roasted coffee ink for organic, readable contrast.
  - **Text Secondary (#57534E):** Warm milk coffee stone for labels and descriptions.
  - **Text Muted (#78716C):** Latte foam stone for placeholders and secondary metadata.

## Component Rule Expectations

### Action Buttons Suite
- **Primary Button (`.btn-primary`)**: `#991B1B` background, `#FFFFFF` text, hover `#7F1D1D`, active `#691515` (`active:scale-[0.98]`), `shadow-xs`. Icons inside primary buttons MUST be stark white (`#FFFFFF`) to ensure clear contrast.
- **Secondary Button (`.btn-secondary`)**: `#FAF7F4` oat cream background, `1px solid #E9E3DD` border, text `#57534E`, hover `#F4EFEA` (border `#D8CFC7`, text `#1C1917`), `active:scale-[0.98]`.
- **Success Button (`.btn-success`)**: `#16A34A` background, hover `#15803D`, active `#166534`, `shadow-xs`.
- **Danger Outline Button (`.btn-danger-outline`)**: `#FFFFFF` background, `#DC2626` text, `1px solid #FECACA` border, hover `#FEF2F2`.

### Segmented Controls & Mode Switchers
- **Outer Shell**: `#FAF7F4` or `#E9E3DD` with `1px solid #E9E3DD`, rounded pill.
- **Active Pill**: `#FFFFFF` with `1px solid #E9E3DD`, `shadow-2xs`, `#1C1917` text, and `#991B1B` icon (or `#991B1B` fill with white text for status filter tabs).
- **Inactive Pill**: Transparent background, text `#78716C`, hover: `bg-white/60`, text: `#1C1917`.

## Strict Zero-Emoji Mandate

- **NEVER USE EMOJIS**: Under no circumstances should emojis be rendered anywhere in the UI, code, buttons, cards, headings, badges, or alerts. Emojis are strictly prohibited.
- **ALWAYS USE ICONIFY**: Use stroke-only vector Lucide icons via Iconify:
  `<span class="iconify" data-icon="lucide:[icon-name]" data-stroke-width="1.8"></span>`

## Strict No-Sub-Detail & No-Badge Mandate

- **NO SUB-DETAIL / NO SUBTITLE UNDER HEADINGS**: Never add sub-detail text, explanatory descriptions, or subtitle captions directly under page titles or section headings (e.g., under "Private Room Approvals", no need to add detail under that).
- **AVOID UNNECESSARY DETAIL**: Do not clutter the interface. Avoid unnecessary text or excessive metadata.
- **NEVER USE BADGES**: Make sure not to use badges for status, counts, or any other metadata. Rely instead on clean text, typography hierarchy, or simple icons.
- Headings and titles must stand bold, clean, and confident on their own without conversational fluff or redundant sub-detail descriptions.

## Accessibility (WCAG 2.2 AA)

- All interactive controls are operable via keyboard.
- Focus indicator: `outline: 2px solid #991B1B; outline-offset: 2px`.
- Contrast ratio >= 4.5:1 for body text, >= 3:1 for large text and controls.
