# 05 - Prioritised Roadmap

This prioritised roadmap details a step-by-step implementation strategy, grouping improvements into structured phases.

---

## Phase 0: Safeguards & Quick Diagnostic Fixes
* **Objective**: Establish baseline security configurations and implement critical input checks.
* **Exact Scope**:
  * Implement strict 11-digit Bangladeshi mobile number regex validation in all contact forms.
  * Correct the local storage height calculations on the companion chat page.
* **Affected Files/Routes**:
  * [compare/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/compare/page.tsx) (Phone input validation)
  * [companion/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/companion/page.tsx) (Viewport styles)
* **Dependencies & Risks**: Zero. Low-risk diagnostic fixes.
* **What Must Not Change**: Core API payloads or routing parameters.
* **Test & QA Requirements**: Verify that non-valid phone inputs block submission. Verify keyboard layout on smaller mobile screens.
* **Acceptance Criteria**: Form submissions fail for phone numbers not matching `^01[3-9]\d{8}$`.
* **Complexity**: S
* **Priority**: P0

---

## Phase 1: Design-System & Application-Shell Foundation
* **Objective**: Standardize design system tokens, layout spacing, and visual primitives.
* **Exact Scope**:
  * Refactor [globals.css](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/globals.css) variables to establish uniform margins, paddings, and font sizes.
  * Extract custom cards and inputs into shared components (`Card`, `InputField`, `Button`).
* **Affected Files/Routes**:
  * `apps/web/app/globals.css`
  * New files in `apps/web/app/components/`
  * [check-loan/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/check-loan/page.tsx), [health/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/health/page.tsx)
* **Dependencies & Risks**: High risk of styling regression. Visual regression tests are required.
* **What Must Not Change**: Mathematical calculation logic.
* **Test & QA Requirements**: Ensure cards render consistently across all pages.
* **Acceptance Criteria**: Inline style margins are replaced with variable-based CSS classes.
* **Complexity**: M
* **Priority**: P1

---

## Phase 2: Core User Journey Redesign
* **Objective**: Refactor primary calculators and product comparison grids.
* **Exact Scope**:
  * Add navigation buttons (e.g., "Back") to the loan checker wizard.
  * Implement responsive grid structures for bank rates in the comparison view.
* **Affected Files/Routes**:
  * [check-loan/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/check-loan/page.tsx)
  * [compare/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/compare/page.tsx)
* **Dependencies & Risks**: Requires coordination with shared TypeScript calculators.
* **What Must Not Change**: Newton-Raphson approximation loop algorithms.
* **Test & QA Requirements**: Test inputs to ensure calculations remain correct after navigation.
* **Acceptance Criteria**: Users can navigate back to step 1 from step 4 in the wizard without losing input values.
* **Complexity**: L
* **Priority**: P1

---

## Phase 3: Secondary Pages & Content Hub Consolidation
* **Objective**: Consolidate repetitive static text guide pages into unified hubs.
* **Exact Scope**:
  * Group `/rights`, `/entitlements`, `/emergency`, `/insurance`, and `/remittance` under `/guides`.
  * Replace long lists with expandable accordion layouts.
* **Affected Files/Routes**:
  * `apps/web/app/rights/page.tsx`
  * `apps/web/app/entitlements/page.tsx`
  * `apps/web/app/emergency/page.tsx`
* **Dependencies & Risks**: Minimal.
* **What Must Not Change**: Content copy and audio file links.
* **Test & QA Requirements**: Verify that voice synthesis (TTS) functions correctly on expanded accordion contents.
* **Acceptance Criteria**: Clean expandable lists replace static paragraphs.
* **Complexity**: M
* **Priority**: P2

---

## Phase 4: Landing Page & Marketing Assets
* **Objective**: Implement a high-conversion landing page to build user trust.
* **Exact Scope**:
  * Design the homepage layout containing the 4 primary actions, the mini-loan calculator, and official data seals.
* **Affected Files/Routes**:
  * [apps/web/app/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/page.tsx)
* **Dependencies & Risks**: Homepage layout changes.
* **What Must Not Change**: Global navigation styles.
* **Test & QA Requirements**: Verify loading speed and layout responsiveness on mobile viewports.
* **Acceptance Criteria**: The scrolling chips row is replaced with the structured value-proposition cards.
* **Complexity**: M
* **Priority**: P2

---

## Phase 5: Launch Readiness & Accessibility Polish
* **Objective**: Audit WCAG accessibility contrast ratios and configure offline capabilities.
* **Exact Scope**:
  * Set up PWA Service Workers to cache resources and offline files.
  * Audit contrast ratios on text elements and add descriptive `aria-label` tags.
* **Affected Files/Routes**:
  * `apps/web/public/`
  * Entire `apps/web/app/` tree
* **Dependencies & Risks**: Requires standard service worker testing.
* **What Must Not Change**: Functional API paths.
* **Test & QA Requirements**: Run Lighthouse accessibility audits.
* **Acceptance Criteria**: Accessibility score reaches 95+ and guides are accessible offline.
* **Complexity**: M
* **Priority**: P3
