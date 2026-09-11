# AGENTS.md

## Autonomous Coding Agent Guidelines

All AI agents working on this codebase must strictly apply the **TypeUI Cafe Design System (with NBC Crimson Heritage)**:

1. **Skill Source of Truth**:
   - Primary Skill: [`.agents/skills/design-system/SKILL.md`](file:///d:/Next/testing/skills/.agents/skills/design-system/SKILL.md)
   - Design Specifications: [`DESIGN.md`](file:///d:/Next/testing/skills/DESIGN.md)
   - Project Guidelines: [`GEMINI.md`](file:///d:/Next/testing/skills/GEMINI.md)

2. **Mandatory UI Rules**:
   - Canvas surface is soft warm cafe cream `#F9F7F5` / `#F5F2EE`, cards are `#FFFFFF` with warm hairline `1px solid #E9E3DD` borders.
   - Sidebar strictly preserves the National Bank of Cambodia rich dark crimson red theme (`#260707` / `#2A0808`), borders `#3D0C0C` / `#450A0A`, and gold accents (`#FACC15`).
   - Primary action color is NBC Crimson Red `#991B1B` (hover: `#7F1D1D`, active: `#691515`). **Icons inside primary red buttons MUST be stark white (`#FFFFFF`) for clear contrast.**
   - Secondary accent is Warm Cream / Oat Milk `#E9E3DD`, warm caramel amber `#D97706`, and official NBC seal heritage `#991B1B`.
   - Typography uses `Poppins` for all headings/display and body, and `JetBrains Mono` for data/metrics.
   - Spacing adheres to comfortable `2/4/8/12/16/24/32/48px` scale.
   - Border radius is soft and approachable: `8px`, `10px`, `12px`, `16px`.
   - Maintain warm, inviting cafe hospitality contrast and deep roasted coffee bean ink `#3E2B1E` readability.

3. **Strict Zero-Emoji & Iconography Mandate**:
   - **DO NOT USE EMOJIS**: Under no circumstances should emojis be rendered in UI elements, buttons, tabs, metadata, or status indicators.
   - **USE ICONIFY NO-FILL (STROKE-ONLY)**:
     All icons must be stroke-only Lucide icons rendered through Iconify:
     `<span class="iconify" data-icon="lucide:[icon-name]" data-stroke-width="2"></span>`
     Do NOT use solid/filled icons unless representing media playback or specific rating stars.

4. **Strict No-Sub-Detail & No-Badge Mandate**:
   - **NEVER ADD SUB-DETAIL OR EXPLANATORY SUBTITLES UNDER HEADINGS**: Under no circumstances should explanatory subtitle paragraphs, helper captions, or sub-detail metadata be rendered directly underneath page titles or section headings.
   - **AVOID UNNECESSARY DETAIL**: Do not clutter the interface. Avoid unnecessary text or excessive metadata.
   - **NEVER USE BADGES**: Make sure not to use badges for status, counts, or any other metadata. Rely instead on clean text, typography hierarchy, or simple icons.
   - Headings must stand clean, bold, confident, and self-explanatory without redundant descriptions.

5. **Mandatory Rule: No Full-Page Vertical Scroll**:
   - **AVOID VERTICAL SCROLL**: Enforce a "No Full-Page Vertical Scroll" policy for desktop dashboards and app views.
   - **INTERNAL SCROLLING ONLY**: Make specific sections (like tables or long lists) scroll internally (`overflow-y-auto`) instead of scrolling the whole browser page. Use `h-screen` or `h-[calc(100vh-offset)]` on main containers.
   - **HIDDEN SCROLLBARS**: Hide scrollbars entirely using CSS for internal scrolling areas to maintain a sleek look, while ensuring it is still scrollable via trackpad/wheel.
