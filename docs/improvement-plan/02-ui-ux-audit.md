# 02 - UI/UX Audit

This audit evaluates the platform's key pages, workflows, navigation architecture, mobile/accessibility behaviors, and proposes a unified design system.

---

## Page-by-Page Audit

### 1. Home Dashboard (`/`)
* **What Works**: High-contrast typography using Noto Sans Bengali. Distinct Bangla labels for primary cards. The privacy disclaimer at the top and source disclaimer at the bottom build immediate trust.
* **UX/UI Issues**:
  * **Visual Overload**: Combining 6 "Primary Cards", a scrolling row of 9 "More Chips", and a "Bottom Nav" with another "More" drawer causes decision paralysis.
  * **Ad-hoc Spacing**: Multiple sections use inline styling overrides for margins, leading to vertical misalignment on standard mobile viewports.
* **Severity**: P1
* **Evidence**: [apps/web/app/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/page.tsx)
* **User Impact**: Users are overwhelmed by choices and struggle to find the high-value calculators.
* **Recommended Action**: **Simplify**. Restructure the homepage to focus exclusively on 4 primary hubs: Calculator, Compare, Cashbook, and AI Assistant. Group all other informational chips into a secondary tab.
* **Acceptance Criteria**:
  * Home contains no more than 4 primary navigation options.
  * Eliminates the horizontal scrolling row.
  * No inline margin overrides are used in layout sections.

---

### 2. AI Companion (`/companion`)
* **What Works**: Prominent voice recording CTA and predefined suggestion buttons. Active transcripts help users correct spoken text before submitting.
* **UX/UI Issues**:
  * **Static Height Calculations**: The container uses `height: calc(100vh - 120px)`. On low-end Android devices with custom browser search bars or keyboards active, the chat input is pushed off-screen.
  * **Speech Fallback Failures**: When the server TTS synthesis fails, browser-native SpeechSynthesis plays, which typically has highly distorted or unavailable Bangla voices.
* **Severity**: P0
* **Evidence**: [apps/web/app/companion/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/companion/page.tsx)
* **User Impact**: Broken viewport on small mobile devices; users cannot submit questions once the virtual keyboard opens.
* **Recommended Action**: **Redesign**. Use dynamic viewport units (`100dvh`) and a flex-based layout wrapper. Disable native speech fallback when Bangla voice profiles are missing in the browser environment, replacing it with a clean visual notice.
* **Acceptance Criteria**:
  * Input bar remains visible above the keyboard on device heights down to 568px (iPhone SE size).
  * Web speech fallback checks for the presence of `bn-BD` local language support before attempting playback.

---

### 3. Loan Checker Wizard (`/check-loan`)
* **What Works**: Multi-step wizard approach lowers cognitive load for microfinance borrowers. Large preset buttons (e.g., ৳৫,০০০, ৳১০,০০০) reduce typing requirements.
* **UX/UI Issues**:
  * **No Back Button**: The step wizard does not provide a "Back" action. If a user makes a mistake on Step 3, they have to refresh the browser and start from the beginning.
  * **Layout Shifts**: The dynamic height of step descriptions shifts inputs vertically on each step, causing accidental clicks on preset buttons.
* **Severity**: P0
* **Evidence**: [apps/web/app/check-loan/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/check-loan/page.tsx)
* **User Impact**: Extreme frustration during data entry; users abandon calculations mid-flow.
* **Recommended Action**: **Redesign**. Introduce a "Back" button on the step header and lock the layout block height to prevent vertical shifting during wizard transitions.
* **Acceptance Criteria**:
  * Users can navigate backward to previous steps while retaining input values.
  * Wizard step transitions cause zero vertical shift in the main inputs.

---

### 4. Product Comparison (`/compare`)
* **What Works**: Easy category filters for DPS, FDR, and loans. Distinct "Islamic Only" flag to filter Shariah-compliant products.
* **UX/UI Issues**:
  * **No Phone Input Validation**: Lead collection accepts any string input as a phone number. Users can submit blank spaces or letters, causing corrupt partner leads.
  * **Absence of Side-by-Side View**: Desktop layout stacks compare cards vertically, ignoring the screen width available for side-by-side comparison tables.
* **Severity**: P1
* **Evidence**: [apps/web/app/compare/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/compare/page.tsx)
* **User Impact**: Partner institutions receive fake leads; users cannot compare product fees side-by-side.
* **Recommended Action**: **Redesign**. Integrate strict 11-digit Bangladeshi mobile number validation (`^01[3-9]\d{8}$`) with real-time helper messages. Build a responsive table view for tablet and desktop viewports.
* **Acceptance Criteria**:
  * Lead submit action is locked until an 11-digit phone number is entered.
  * Tablet and desktop layouts display comparisons in a grid rather than a list.

---

### 5. Informational Guides (`/rights`, `/entitlements`, `/emergency`)
* **What Works**: High relevance of topics (land rights, crop fail steps, flood emergencies). AudioAssist lets users listen to paragraphs.
* **UX/UI Issues**:
  * **Walls of Text**: High density of nested lists and text blocks. Low-literacy users cannot digest this amount of information.
  * **Duplicate Layout Code**: All five guide pages replicate identical card structures and state management inline.
* **Severity**: P1
* **Evidence**: [apps/web/app/rights/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/rights/page.tsx), [apps/web/app/entitlements/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/entitlements/page.tsx)
* **User Impact**: Users ignore the advice due to text-heavy layout fatigue.
* **Recommended Action**: **Merge & Redesign**. Combine rights and entitlements into a single "Education & Help Hub". Display content using progressive disclosure (expandable accordions with visual icons representing key themes).
* **Acceptance Criteria**:
  * Individual guide pages are refactored to use a single shared list component.
  * Heavy text blocks are hidden behind expandable sections.

---

## Component Consolidation Matrix
To remove duplication and ensure design consistency, we should consolidate scattered styling patterns:

| Current Duplicate Components | Proposed Shared Primitive | File Path Evidence |
|-----------------------------|---------------------------|-------------------|
| Custom card designs in `compare/page.tsx`, `health/page.tsx`, and `emergency/page.tsx` | `Card` (with padding and border tokens) | `compare/page.tsx` L108, `health/page.tsx` L84 |
| Inline inputs in `health/page.tsx` and `check-loan/page.tsx` | `InputField` (with built-in validation label) | `health/page.tsx` L66, `check-loan/page.tsx` L131 |
| Repeated step headers in `check-loan` and `savings` planner | `WizardStepHeader` | `check-loan/page.tsx` L10, `components/WizardStepHeader.tsx` |
| Duplicate overlay drawers in `BottomNav` and scenario planners | `BottomDrawer` | `components/BottomNav.tsx` L38 |

---

## Navigation & Information Architecture

```
Current (Cluttered):
Home (/)
 ├── AI Companion (/companion)
 ├── Cashbook (/cashbook)
 ├── Protection (/protect)
 └── More Drawer
      ├── Check Loan (/check-loan)
      ├── Compare (/compare)
      ├── Savings (/savings)
      ├── Emergency (/emergency)
      ├── Rights (/rights)
      ├── Entitlements (/entitlements)
      └── 6 other pages...

Proposed (Consolidated):
Home (/)
 ├── AI Companion (/companion)
 ├── Cashbook (/cashbook)
 └── Tools Hub (/tools)
      ├── Loan & Savings Calculators (/tools/calculator)
      ├── Product Compare (/tools/compare)
      └── Directory & Branches (/tools/locator)
 └── Guide Hub (/guides)
      ├── Scam Protection & Fraud (/guides/protect)
      ├── Rights & Entitlements (/guides/education)
      └── Emergency Guides (/guides/emergency)
```

---

## Accessibility & Responsive Findings
1. **Touch Targets**: Several links and category filters have dimensions below the WCAG 2.5.8 recommendation (`48px` minimum).
2. **Text Zooming**: The font-size in CSS uses absolute pixels in multiple components, preventing appropriate text scaling when users change system accessibility settings.
3. **Screen Readers**: Interactive elements (like the audio play icons in `AudioAssist`) lack descriptive `aria-label` tags in Bangla, causing confusion for blind or low-vision users.

---

## Proposed Design System Specification
* **Color Role Mapping**:
  * Primary: `#006A4E` (Bangladesh Green - trust and stability)
  * Secondary / Accent: `#F42A41` (Bangladesh Red - sparingly for emergency warnings or critical errors)
  * Surface Background: `#F7F9F8` (Off-white - reduces eye strain)
* **Typography Scale**:
  * Body text: `1rem` (equivalent to `17px` for enhanced Bangla script legibility)
  * Headings: `1.25rem` (medium), `1.5rem` (large)
  * Line Height: Minimum `1.6` for Noto Sans Bengali to prevent vowel/consonant character overlaps.
* **Layout Grid**: Single-column flexible grid bounded at `480px` for mobile viewports, transitioning to dual-column structures on screen widths larger than `768px`.
