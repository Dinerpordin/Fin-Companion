# 03 - Market & Competitor Research

This research benchmarks comparable platforms in Bangladesh and adjacent South Asian markets to extract design lessons, user trends, and information architecture best practices.

---

## Benchmark Competitors

### 1. bKash Mobile App (bKash Limited)
* **Positioning**: The dominant Mobile Financial Services (MFS) provider in Bangladesh.
* **Information Architecture**: A simple grid dashboard featuring large icons, flat tabs, and card-based flows for savings and micro-loans.
* **Trust & Accessibility**: Utilizes a highly prominent, Bangla-first help center and localized voice instructions in native campaigns.
* **Sources**: [bkash.com](https://www.bkash.com) (Accessed July 2026).

### 2. TallyKhata App (Progoti Systems)
* **Positioning**: A mobile ledger and bookkeeping application for small merchants and micro-entrepreneurs in Bangladesh.
* **Information Architecture**: Local-first entry sheets with simplified "আদা" (Received) and "দেয়া" (Given) inputs.
* **Trust & Accessibility**: Operates offline without database barriers, showing data security badges locally.
* **Sources**: [tallykhata.com](https://tallykhata.com) (Accessed July 2026).

### 3. MoneySaverBD
* **Positioning**: A web comparison platform for credit cards, FDR, and DPS schemes in Bangladesh.
* **Information Architecture**: Text-dense tables presenting bank interest rates, nominal APRs, and maturity terms.
* **Trust & Accessibility**: High information density; optimized for middle-class, English-literate desktop users.
* **Sources**: [moneysaverbd.com](https://moneysaverbd.com) (Accessed July 2026).

### 4. PolicyBazaar & BankBazaar (India/South Asia Adjacent)
* **Positioning**: Multi-tier financial comparison search engines.
* **Information Architecture**: High-conversion landing grids that require phone number registration and OTP verification before displaying rate tables.
* **Trust & Accessibility**: Built on aggressive lead collection, which can alienate first-time or risk-averse consumers.
* **Sources**: [policybazaar.com](https://www.policybazaar.com) (Accessed July 2026).

---

## Lessons & Insights

### What to Adapt
1. **Simplified Bookkeeping UX (From TallyKhata)**: Limit transactions in the cashbook (`/cashbook`) to two primary flows: "আয়" (Income) and "ব্যয়" (Expense). Keep calculations simple and store them locally.
2. **Icon-Guided Menus (From bKash)**: Replace text links with high-contrast, labeled action grids (minimum target size `48px` x `48px`) to make navigation easier for users with lower digital literacy.
3. **Impartiality Badging (From MoneySaverBD)**: Clearly state the last-verified date and official source for every bank rate shown, which builds user trust.

### What to Avoid
1. **Forced Registration Walls (From PolicyBazaar)**: Do not require users to log in or verify their phone number just to see basic DPS or FDR rates. Keep lead capture voluntary.
2. **Text-Heavy Layout Stacking (From MoneySaverBD)**: Avoid dense tables on mobile displays. Stacking massive columns causes horizontal scroll issues and frustrates users.
3. **Intrusive Advertisements**: Keep financial calculators and emergency guides free of ads to prevent users from feeling pushed toward a specific lender.

---

## Competitor Feature Comparison
The table below compares the functional focus of the platforms:

| Feature | bKash | TallyKhata | MoneySaverBD | Financial Companion (This Project) |
|---------|-------|------------|--------------|-------------------------------------|
| Platform Scope | Transactions & Savings | Merchant Bookkeeping | Financial Comparison | Impartial Calculators, Compare & AI Assistant |
| Login Requirement | Mandatory | Mandatory | None | None (Phase 1) |
| Bangla Voice Support | Basic | None | None | Comprehensive (STT + TTS) |
| Offline Availability | No | Yes (Local Cache) | No | Yes (Calculators & Cashbook) |
| Ad-Free Content | Yes | Yes | No | Yes |
