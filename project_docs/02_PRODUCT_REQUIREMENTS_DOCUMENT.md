# Product Requirements Document

## Product name

Bangladesh Financial Companion Platform

## Goal

Deliver a privacy-first financial comparison and guidance platform for Bangladesh with an AI access layer for text and voice.

## Platform requirements

- Sensitive loan and health calculations must run client-side in Phase 1.
- No mandatory account creation in Phase 1.
- No raw financial inputs stored server-side.
- Every product card must show source URL and last-verified date.
- Ranking must be transparent and impartial.
- Sensitive tools must remain ad-free in Phase 1.
- UI must be Bangla-first and mobile-first.
- Low-end Android and 3G performance are required.

## Phase 1 modules

1. Loan Reality Checker
2. Product Comparison Hub
3. Financial Health Assessment
4. Free Accounting Tool
5. Economic Impact Dashboard
6. What-If Scenario Planner
7. Locator
8. Freemium Application Document Pack Generator
9. AI Financial Companion

## 1. Loan Reality Checker

### Inputs
- loan amount
- instalment amount
- instalment frequency
- number of instalments
- upfront fees
- lender type
- purpose (optional)
- support for up to 5 concurrent loans

### Outputs
- total repay
- total extra paid
- effective cost band
- time remaining
- comparison against formal alternatives
- potential savings from switching
- consolidated multi-loan view

### Constraints
- all calculations client-side
- outputs in BDT and time first
- non-judgmental language
- no login required

## 2. Product Comparison Hub

### Categories
- FD/FDR
- DPS
- savings accounts
- personal loans
- credit cards
- later: home loans, auto loans, Islamic variants, basic insurance

### Fields
- provider
- product name
- product category
- rates
- tenor
- min amount
- max amount
- fees
- Islamic/conventional flag
- source
- last-verified date
- official link
- confidence status

### Features
- filter by category, amount, tenure, type
- sort by return or cost
- freshness badge
- transparent ranking
- sponsored labels only in later phase

## 3. Financial Health Assessment

### Inputs
- income band
- fixed costs
- debt repayments
- savings
- household type
- optional MFS summary

### Outputs
- cash-flow stability signal
- debt pressure signal
- savings potential estimate
- next-tool guidance only

## 4. Free Accounting Tool

### Features
- add income and expense entries
- Bangla categories
- daily, weekly, monthly summaries
- local device storage
- optional CSV/PDF export
- optional local PIN

## 5. Economic Impact Dashboard

### Content
- repo rate changes
- deposit and lending rate moves
- inflation
- FX and remittance changes
- regulatory changes

### Card structure
- plain Bangla summary
- affected segment
- why it matters
- deep link to relevant tool

## 6. What-If Scenario Planner

### Scenarios
- pay more per instalment
- refinance
- switch savings product
- start monthly DPS
- reduce expenses and reallocate

### Output rules
- BDT and time first
- deterministic logic only
- no advisory language

## 7. Locator

### Features
- district/upazila search
- GPS-based lookup
- nearest MFIs
- nearest agent banking outlets
- nearest bank branches
- institution type
- product coverage
- documentation checklist

## 8. Freemium Application Document Pack Generator

### Free tier
- checklist
- required fields list
- institution guidance

### Freemium tier
- pre-filled PDF application forms
- multi-bank packs
- printable cover sheet
- neutral disclaimer on all documents

### Privacy
- personal details filled client-side where possible
- if server-side generation is needed, auto-delete within 2 hours
- no long-term storage of personal application data

## 9. AI Financial Companion

### Channels
- web text chat
- web voice input/output
- WhatsApp in later phase
- IVR/USSD-lite in later phase

### Capabilities
- explain current loan cost
- simulate upcoming loan scenarios
- compare products
- find nearby providers
- explain how to apply
- route into platform tools
- answer financial education questions in plain Bangla

## Non-functional requirements

### Privacy
- no raw sensitive data storage server-side in Phase 1
- analytics exclude raw financial inputs

### Security
- encrypted in transit
- secrets management
- dependency scanning
- access controls for admin/scraper systems

### Performance
- core pages should load fast on 3G
- PWA with partial offline capability
- graceful degradation for weaker devices

### Accessibility
- Bangla-first
- large tap targets
- low-clutter layout
- no jargon in primary UI
- text and audio support where useful

### Transparency
- every product shows source and last-verified date
- ranking logic must be explainable
- sponsorship clearly labelled when introduced

### Scalability
- support concurrent sessions
- support 61+ bank scraping pipelines
- modular architecture for progressive rollout

## Success criteria

- core flows usable without login
- users can understand loan cost in plain Bangla
- users can compare products with freshness indicators
- users can find nearby providers
- assistant can route correctly across major intents
- privacy promises are technically enforced