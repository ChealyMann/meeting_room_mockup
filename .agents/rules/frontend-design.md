# Frontend Design Rule: Impeccable UI System & Iconography

## Scope
Applies to all frontend files (`*.html`, `*.css`, `*.js`, `*.tsx`, `*.jsx`, `*.vue`).

## Directives
1. **Design Tokens First (Impeccable)**:
   - Canvas: `var(--surface-base, #FBF9F5)` (Warm Cream)
   - Panel/Card Surface: `var(--surface-card, #FFFFFF)`
   - Editorial Accent Surface: `var(--surface-burnt-orange, #C55221)`
   - Subtle Surface: `var(--surface-muted, #F3ECE2)`
   - Hairline Border: `var(--border-subtle, #E8E2D8)`
   - Strong Border: `var(--border-strong, #111827)`
   - Primary Accent: `var(--color-primary, #CC8800)` (Sharp Amber)
   - Secondary Accent: `var(--color-secondary, #C55221)` (Burnt Orange)
   - Success: `var(--color-success, #16A34A)`
   - Warning: `var(--color-warning, #D97706)`
   - Danger: `var(--color-danger, #DC2626)`
   - Text Primary: `var(--text-primary, #111827)`
   - Text Muted: `var(--text-muted, #4B5563)`
   - Text Tertiary: `var(--text-tertiary, #9CA3AF)`

2. **Typography**:
   - Display & Headings: `Chakra Petch`, sans-serif (weights: 600, 700)
   - Body: `Chakra Petch`, sans-serif (weights: 400, 500)
   - Monospace & Metrics: `JetBrains Mono`, monospace (weights: 500, 600)

3. **Graphic Editorial Aesthetics**:
   - High editorial contrast, warm cream backdrop, burnt orange accents, sharp amber highlights.
   - Refined border radii: `4px` (sm) and `8px` (md).

4. **Iconography Standard: Zero Emoji Policy**:
   - **NEVER use unicode emojis** in UI components, buttons, badges, tables, or labels.
   - **ALWAYS use Iconify** with **stroke-only (no fill)** icons from the `lucide` icon set:
     ```html
     <span class="iconify" data-icon="lucide:calendar" data-stroke-width="2"></span>
     ```
   - Icons must inherit color via `currentColor` or explicit utility classes.
   - Consistent stroke width: `data-stroke-width="1.8"` or `"2"`.
