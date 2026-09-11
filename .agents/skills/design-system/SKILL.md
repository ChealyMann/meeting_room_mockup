---
name: cafe
description: Cozy, warm, and handcrafted atmosphere inspired by an artisan coffee counter, featuring Poppins typography, warm latte cream surfaces, deep roasted coffee bean ink, and the authoritative National Bank of Cambodia (NBC) dark crimson red sidebar heritage.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# Cafe Design System Skill (Universal + NBC Crimson Heritage)

## Mission

You are an expert design-system guideline author for the **Cafe** design system, tailored specifically for the **National Bank of Cambodia (NBC) Meeting Room Reservation Management System**.
Create practical, implementation-ready guidance that combines the warm, approachable hospitality of **Cafe** with the authoritative National Bank of Cambodia dark crimson red sidebar heritage.

## Brand

A cozy, warm, and handcrafted aesthetic inspired by artisan coffee counters and hospitality spaces, fused seamlessly with the regal authority of the National Bank of Cambodia. It balances approachable organic coffee warmth with executive banking precision.

## Style Foundations

### Visual Style
- **Atmosphere**: Warm, inviting, cozy cafe-inspired interface with warm tones, soft typography, tactile micro-interactions, and clean layouts for a relaxed, premium browsing experience.
- **Surface Elevation**: Layered warm surfaces (Oat Canvas -> Crisp White Cards -> Subtle Oat Card Insets) with hairline warm borders (`1px solid #E9E3DD`).

### Typography Scale & Hierarchy
- **Display & Headings**: `Poppins`, sans-serif (weights: 300, 400, 500, 600, 700, 800) for approachable, rounded, humanistic readability.
- **Khmer Script**: `Kantumruy Pro`, sans-serif (weights: 400, 500, 600, 700) for Cambodian official text.
- **Monospace & Data Metrics**: `JetBrains Mono`, monospace (weights: 400, 500, 600, 700) for room IDs, booking reference codes, timestamps, capacities, and currency.
- **Typography Scale**:
  - `Display / Hero`: `2.25rem` (36px) | Line height: `1.2` | Weight: `700` or `800`
  - `H1 / Section Title`: `1.5rem` (24px) | Line height: `1.25` | Weight: `700`
  - `H2 / Page Title`: `1.25rem` (20px) | Line height: `1.3` | Weight: `700`
  - `H3 / Card Title`: `1rem` (16px) | Line height: `1.4` | Weight: `600`
  - `Body Regular`: `0.875rem` (14px) | Line height: `1.5` | Weight: `400` / `500`
  - `Body Small / Caption`: `0.75rem` (12px) | Line height: `1.4` | Weight: `400` / `500`
  - `Micro / Tag`: `0.6875rem` (11px) | Line height: `1.2` | Weight: `600` / `700`

### Color Palette & Token System
- **Primary Action**: NBC Crimson Red `#991B1B` (hover: `#7F1D1D`, active: `#691515`) for primary action buttons, active navigation pills, and interactive highlights.
- **Secondary Accent / Border**: Warm Cream / Oat Milk `#E9E3DD` for borders, dividers, subtle chip tracks.
- **Base Canvas**: Soft Warm Cafe Surface `#F9F7F5` / `#F5F2EE` (`--bg-app`).
- **Card Surface**: Warm Crisp White `#FFFFFF` (`--bg-card`) with hairline warm border `1px solid #E9E3DD`.
- **Subtle Surface**: Soft Oat Cream `#FAF7F4` / `#F4EFEA` (`--bg-card-subtle`).
- **Sidebar (NBC Crimson Heritage)**: Rich Dark Burgundy/Crimson `#260707` / `#2A0808` with deep borders `#3D0C0C` / `#450A0A` and gold badges (`#FACC15`).
- **Accent / Gold**: Warm Artisan Amber/Caramel `#D97706` / `#FACC15` (light: `#FEF3C7`).
- **NBC Heritage Red**: `#991B1B` for official approval stamps, bank seal, and primary actions.
- **Success**: Organic Forest/Emerald Green `#16A34A` / `#059669` (light: `#DCFCE7`, text: `#15803D`).
- **Warning**: Warm Spiced Amber `#D97706` (light: `#FEF3C7`, text: `#92400E`).
- **Danger**: Crimson Red `#DC2626` (light: `#FEF2F2`, text: `#991B1B`).
- **Text Primary**: Deep Roasted Coffee Ink `#1C1917` / `#3E2B1E`.
- **Text Secondary**: Warm Milk Coffee Stone `#57534E` / `#6F5849`.
- **Text Muted**: Muted Oat / Latte Foam `#78716C` / `#A8988B`.

### Spacing Scale & Rhythm
- Comfortable 8-point harmonic rhythm:
  - `2xs`: 2px
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 12px
  - `lg`: 16px
  - `xl`: 24px
  - `2xl`: 32px
  - `3xl`: 48px

### Corners & Radii Hierarchy
- `rounded-sm`: 4px - 6px (micro chips, inner tags)
- `rounded-md`: 8px (standard action buttons, form inputs)
- `rounded-lg`: 10px (cards, modals, dropdown panels)
- `rounded-xl`: 12px (feature callout cards, peek drawers)
- `rounded-2xl`: 16px (large surface containers)
- `rounded-full`: 9999px (pills, badges, segmented controls)

### Elevation & Ambient Shadows
- Soft warm ambient cafe shadows:
  - `shadow-2xs`: `0 1px 2px rgba(42, 8, 8, 0.04)`
  - `shadow-xs`: `0 1px 3px rgba(42, 8, 8, 0.06), 0 1px 2px rgba(42, 8, 8, 0.04)`
  - `shadow-md`: `0 4px 12px rgba(42, 8, 8, 0.06), 0 2px 4px rgba(42, 8, 8, 0.04)`
  - `shadow-lg`: `0 10px 25px rgba(42, 8, 8, 0.08), 0 4px 10px rgba(42, 8, 8, 0.04)`

## Component Rule Expectations

### 1. Action Buttons Suite
- **Primary Button (`.btn-primary`)**:
  - Background: NBC Crimson Red `#991B1B`
  - Hover: `#7F1D1D` with soft crimson glow `box-shadow: 0 3px 8px rgba(153, 27, 27, 0.3)`
  - Active: `#691515` with tactile scale `transform: scale(0.98)`
  - Text: `#FFFFFF`, `Poppins`, font-bold, `rounded-lg`
  - Icon: Stroke-only Lucide icon in stark white (`text-white` or `#FFFFFF`) to ensure high contrast against the red background.
- **Secondary Button (`.btn-secondary`)**:
  - Background: Soft Oat Cream `#FAF7F4` with warm border `1px solid #E9E3DD`
  - Hover: `#F4EFEA`, border: `#D8CFC7`, text: `#1C1917`
  - Active: `#E9E3DD`, `transform: scale(0.98)`
  - Text: `#57534E`, `Poppins`, font-semibold, `rounded-lg`
- **Success Button (`.btn-success`)**:
  - Background: Organic Forest Emerald `#16A34A`
  - Hover: `#15803D`, active: `#166534`, `transform: scale(0.98)`
  - Text: `#FFFFFF`, font-bold, `shadow-xs`
- **Danger Outline Button (`.btn-danger-outline`)**:
  - Background: `#FFFFFF`, text: `#DC2626`, border: `1px solid #FECACA`
  - Hover: `#FEF2F2`, border: `#FCA5A5`, text: `#B91C1C`
  - Active: `#FEE2E2`, `transform: scale(0.98)`

### 2. Segmented Controls & Mode Switchers
- **Container**: Oat cream track `#FAF7F4` or `#E9E3DD` with hairline border `#D8CFC7` or `#E9E3DD`, `rounded-lg` or `rounded-full`, padding `3px`.
- **Active Pill**: Pure crisp white `#FFFFFF` with border `#E9E3DD`, shadow `shadow-2xs`, roasted coffee text `#1C1917`, and NBC Crimson Red icon `#991B1B` (or `#991B1B` fill with white text for status filter tabs).
- **Inactive Pill**: Transparent background, text `#78716C`, hover: `bg-white/60`, text: `#1C1917`.

### 3. Form Inputs (`.bank-input`)
- Background: `#FFFFFF`, border: `1px solid #E9E3DD`, border-radius: `0.5rem` (8px), text: `#1C1917`.
- Hover: border `#D8CFC7`.
- Focus: border `#991B1B`, `box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12)`.
- Icon inside input: `#78716C`, transitions to `#991B1B` on `:focus-within`.

### 4. Cards & Panels (`.slate-card`)
- Background: `#FFFFFF` with `border: 1px solid #E9E3DD`, `border-radius: 0.875rem` (14px).
- Hover: border `#D8CFC7`, subtle elevation `0 4px 14px rgba(93, 68, 50, 0.08)`.

## Strict Zero-Emoji & Iconography Mandate

- **NEVER USE EMOJIS**: Under no circumstances should emojis be rendered in UI elements, buttons, tabs, metadata, or status indicators.
- **USE ICONIFY NO-FILL (STROKE-ONLY)**:
  All icons must be stroke-only Lucide vector icons rendered through Iconify:
  `<span class="iconify" data-icon="lucide:[icon-name]" data-stroke-width="1.8"></span>`
- **Optical Consistency**: Icons must inherit font color (`currentColor`) or explicit utility color, maintain consistent stroke widths (`1.8` or `2`), and be optically aligned with text.

## Strict No-Sub-Detail & No-Badge Mandate

- **NEVER ADD SUB-DETAIL OR EXPLANATORY SUBTITLES UNDER HEADINGS**: Under no circumstances should explanatory subtitle paragraphs, helper captions, or sub-detail descriptions be placed directly underneath page titles or section headings (e.g., under "Private Room Approvals", do NOT add secondary descriptions like "Executive review and authorization for confidential boardrooms & private suites.").
- **CLEAN & CONFIDENT HEADINGS**: Headings must stand clean, bold, confident, and self-explanatory on their own. Eliminate conversational fluff or redundant explanatory subtitles below headings.
- **AVOID UNNECESSARY DETAIL**: Do not clutter the interface with excessive metadata, secondary descriptions, or unneeded text elements. Maintain a clean, dense, yet approachable aesthetic.
- **NEVER USE BADGES**: Make sure not to use badges for status, counts, or other metadata. Rely instead on clean typography hierarchy, simple text, or pill switchers.

## Mandatory Rule: No Full-Page Vertical Scroll

- **AVOID VERTICAL SCROLL**: Enforce a "No Full-Page Vertical Scroll" policy for desktop dashboards and app views (e.g. review workspaces).
- **INTERNAL SCROLLING ONLY**: Utilize horizontal space, grids, and columns. Make specific sections (like tables, long lists, or chat panels) scroll internally (`overflow-y-auto`) instead of scrolling the whole browser page. Ensure main containers use `h-screen` or `h-[calc(100vh-offset)]`.
- **HIDDEN SCROLLBARS**: For sections that require internal scrolling, hide the scrollbars entirely using CSS (`scrollbar-width: none`, `::-webkit-scrollbar { display: none; }`) for a sleek, clean look, while maintaining scrollability via trackpad or mouse wheel.
## Accessibility (WCAG 2.2 AA)

- **Keyboard-First Interactions**: Every interactive element (buttons, tabs, inputs, rows, modals) must be reachable and operable via keyboard (`Tab`, `Enter`, `Space`, `Escape`).
- **Visible Focus States**: Explicit focus indicators: `outline: 2px solid #991B1B; outline-offset: 2px`.
- **Contrast Ratios**: Minimum contrast ratio of 4.5:1 for standard body text and 3:1 for large display text and UI components.
- **Aria Labels**: All icon-only buttons must include descriptive `aria-label` or `title` attributes.

## Writing Tone

- **Voice**: Concise, confident, helpful, professional central-banking authority balanced with hospitable clarity.
- **Clarity**: State actions plainly (e.g. "Quick Approve", "Review & Adjust Hours", "Reset Filters").

## Rules: Do

- Prefer semantic tokens (`var(--brand-primary)`, `--bg-app`, `--bg-card`, `--border-subtle`) over raw ad-hoc values.
- Preserve visual hierarchy: Canvas (`#F9F7F5`) -> Card (`#FFFFFF`) -> Inset (`#FAF7F4`).
- Maintain the rich dark crimson red theme in the sidebar (`#260707` / `#2A0808`).
- Keep interaction states tactile with smooth micro-animations (`active:scale-[0.98] transition-all`).
- Maintain stroke-only Lucide vector icons via Iconify.

## Rules: Don't

- Never use cold gray or stark black backgrounds (`#000000` / `#111827`).
- Never use emojis anywhere in the interface.
- Never add sub-detail text, explanatory descriptions, or subtitle captions under page titles and section headings.
- Never use low-contrast text or ambiguous labels.
- Never allow inconsistent spacing rhythm.

## Guideline Authoring Workflow

1. **Restate Intent**: State the design and UX goal in one sentence before proposing rules.
2. **Foundations First**: Define color tokens, typography, surfaces, and spacing constraints before component-level guidance.
3. **Component Anatomy**: Detail states (default, hover, focus-visible, active, disabled, loading, error).
4. **Accessibility Criteria**: Provide verifiable WCAG 2.2 AA acceptance criteria.
5. **Quality Gates & Anti-patterns**: Explicitly specify prohibited implementations and paired do/don't examples.
6. **Code Review QA Checklist**: Deliver a concrete checklist for implementation verification.

## Quality Gates

- No rule should depend on ambiguous adjectives alone; anchor every rule to a concrete token, threshold, or example.
- Every accessibility statement must be testable in code or browser inspect.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, and prioritize accessibility.
<!-- TYPEUI_SH_MANAGED_END -->
