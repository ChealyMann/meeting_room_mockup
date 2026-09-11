# Project Antigravity Instructions: Cafe Design System (NBC Crimson Heritage)

## Core Instruction
Before generating, modifying, or refactoring any frontend UI components or pages in this project:
1. **Always read and adhere to**:
   - [`.agents/skills/design-system/SKILL.md`](file:///d:/Next/testing/skills/.agents/skills/design-system/SKILL.md)
   - [`DESIGN.md`](file:///d:/Next/testing/skills/DESIGN.md)

## Design System Rules & Tokens (Cafe + NBC Crimson Heritage)
- **Theme**: Cafe with NBC Crimson Heritage — Cozy, warm, and handcrafted atmosphere inspired by an artisan coffee counter, combined with the National Bank of Cambodia's rich dark crimson red sidebar and official seal heritage.
- **Surfaces**:
  - Canvas / Background: `#F9F7F5` (Soft warm cafe surface)
  - Card / Panel Surface: `#FFFFFF` (Warm crisp white) with `border: 1px solid #E9E3DD`
  - Subtle Hover / Active Surface: `#FAF7F4` / `#F4EFEA`
  - Sidebar Surface: `#260707` / `#2A0808` (NBC rich dark crimson red) with `border-r: 1px solid #450A0A` and inner borders `#3D0C0C`
- **Brand & Accent Colors**:
  - Primary Action: `#991B1B` (NBC Crimson Red, hover: `#7F1D1D`, active: `#691515`). **Icons inside primary red buttons MUST be stark white (`#FFFFFF`) for clear contrast.**
  - Secondary Accent / Border: `#E9E3DD` (Warm oat milk / cream)
  - Warm Caramel / Amber: `#D97706` / `#FACC15`
  - NBC Crimson Heritage: `#991B1B` (For official bank seals, stamps, and alert highlights)
  - Success: `#16A34A` (Organic forest/emerald green)
  - Warning: `#D97706` (Spiced amber)
  - Danger: `#DC2626` (Crimson red)
  - Text Primary: `#3E2B1E` (Deep roasted coffee bean ink)
  - Text Secondary: `#6F5849` (Warm milk coffee stone)
  - Text Muted: `#7D6857` (Latte foam stone)
- **Typography**:
  - Display & Headings: `Poppins`, sans-serif (weights 600, 700, 800)
  - Primary & Body: `Poppins`, sans-serif (weights 400, 500)
  - Monospace & Metrics: `JetBrains Mono`, monospace
  - Khmer: `Kantumruy Pro`, sans-serif
  - Scale: `12px`, `14px`, `16px`, `18px`, `20px`, `24px`, `32px`
- **Spacing Scale**: 2/4/8/12/16/24/32/48px comfortable spacing.
- **Borders & Radii**:
  - Soft, rounded corners: `rounded-md: 8px`, `rounded-lg: 10px`, `rounded-xl: 12px`, `rounded-2xl: 16px`, `rounded-full: 9999px`.
  - Borders: `1px solid #E9E3DD`.
- **Accessibility (WCAG 2.2 AA)**:
  - Visible focus indicators (`outline: 2px solid #991B1B; outline-offset: 2px`).
  - Tactile, explicit hover and active states with warm micro-animations.

## Mandatory Iconography Rules (Strict Zero-Emoji Policy)
- **NEVER USE EMOJIS** anywhere in the UI, code, buttons, cards, headings, badges, or alerts. Emojis are strictly prohibited.
- **ALWAYS USE ICONIFY**: Use the Iconify SVG framework (`https://code.iconify.design/3/3.1.1/iconify.min.js`).
- **STROKE-ONLY (NO FILL)**: Always use stroke-only vector icons with the Lucide icon set:
  `<span class="iconify" data-icon="lucide:[icon-name]" data-stroke-width="2"></span>`
- **Optical Consistency**: Icons must inherit font color (`currentColor`) or explicit utility color, maintain consistent stroke widths (`1.8` or `2`), and be optically aligned with text.

## Mandatory Rule: Never Use Sub-Detail & Never Use Badges
- **NO SUB-DETAIL / NO SUBTITLE UNDER HEADINGS**: Never add sub-detail text, explanatory descriptions, or subtitle captions directly under page titles or section headings (e.g., under "Private Room Approvals", no need to add detail under that).
- **AVOID UNNECESSARY DETAIL**: Do not clutter the interface. Avoid unnecessary text or excessive metadata.
- **NEVER USE BADGES**: Make sure not to use badges for status, counts, or any other metadata. Rely instead on clean text, typography hierarchy, or simple icons.
- Headings and titles must stand bold, clean, and confident without conversational fluff or redundant sub-detail descriptions.

## Mandatory Rule: No Full-Page Vertical Scroll
- **AVOID VERTICAL SCROLL**: Enforce a "No Full-Page Vertical Scroll" policy for desktop dashboards and app views (e.g. review workspaces).
- **INTERNAL SCROLLING ONLY**: Utilize horizontal space, grids, and columns. Make specific sections (like tables, long lists, or chat panels) scroll internally (`overflow-y-auto`) instead of scrolling the whole browser page. Ensure main containers use `h-screen` or `h-[calc(100vh-offset)]`.
- **HIDDEN SCROLLBARS**: For sections that require internal scrolling, hide the scrollbars entirely using CSS (`scrollbar-width: none`, `::-webkit-scrollbar { display: none; }`) for a sleek, clean look, while maintaining scrollability via trackpad or mouse wheel.
