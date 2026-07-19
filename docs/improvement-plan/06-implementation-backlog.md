# 06 - Implementation Backlog

This implementation backlog maps specific technical improvements, their priorities, and engineering complexities.

| ID | Priority | Phase | Title | User / Business Impact | Complexity | Dependencies | Affected Files/Components | Acceptance Criteria | Rec |
|---|---|---|---|---|---|---|---|---|---|
| IMP-01 | P0 | Phase 0 | Strict Phone Number Validation | Blocks fake/broken partner leads | S | None | [compare/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/compare/page.tsx) | Submit locks unless input matches `^01[3-9]\d{8}$` | **Do Now** |
| IMP-02 | P0 | Phase 0 | Companion Layout Height Fix | Keyboard doesn't push input off-screen on low-end mobiles | S | None | [companion/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/companion/page.tsx) | Content scrolls and inputs remain visible above keyboard | **Do Now** |
| IMP-03 | P1 | Phase 1 | Design System Standardization | Consistent layout and styling across screens | M | None | [globals.css](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/globals.css), shared components | Replace inline style margins with CSS variables | **Do Now** |
| IMP-04 | P1 | Phase 2 | Loan Checker Wizard Back Button | Let users correct errors on previous steps | M | IMP-03 | [check-loan/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/check-loan/page.tsx) | "Back" button functions, retaining input state | **Next** |
| IMP-05 | P1 | Phase 2 | Responsive Compare Grid | Multi-column comparison tables on desktop/tablet | M | IMP-03 | [compare/page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/compare/page.tsx) | Displays cards side-by-side on viewport widths >768px | **Next** |
| IMP-06 | P2 | Phase 3 | Guide Hub Consolidation | Merge repetitive static text guides into a clean layout | M | IMP-03 | `/rights`, `/entitlements`, `/emergency` | A single shared page layout handles guide content | **Next** |
| IMP-07 | P2 | Phase 3 | Progressive Disclosure for Text Guides | Reduces cognitive overload for low-literacy users | S | IMP-06 | `/guides` | Long text blocks are hidden behind expandable accordions | **Next** |
| IMP-08 | P2 | Phase 4 | Landing Page Consolidation | Simpler homepage, removing horizontal scroll chips | M | IMP-03 | [page.tsx](file:///C:/Dev_Projects/Financial%20Companion/apps/web/app/page.tsx) | Horizontal chips row is replaced with 4 primary action cards | **Later** |
| IMP-09 | P3 | Phase 5 | WCAG Contrast & Aria-label Audit | Accessibility support for low-vision/blind users | S | None | Entire application tree | Key elements pass contrast ratios and feature labels | **Later** |
| IMP-10 | P3 | Phase 5 | Service Worker Cache Configuration | Support offline access for critical disaster guides | M | None | `apps/web/public/`, PWA setup | Guides page operates without a network connection | **Later** |
