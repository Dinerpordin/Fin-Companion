# Data Sources and Pipelines

## Data source policy

Use only public, non-authenticated, lawfully accessible sources in Phase 1. Treat Bangladesh Bank public data as the highest-trust source for deposit-related rates and official public regulatory publications as the highest-trust source for macro and policy context.

## Priority source groups

### Official and regulatory
1. Bangladesh Bank interest and deposit tables
2. Bangladesh Bank BRPD circulars
3. Bangladesh Bank agent banking dataset
4. World Bank Open Data
5. MRA or MFI publications
6. public regulator and institutional PDFs where relevant

### Institutional websites
1. bank deposit pages
2. DPS pages
3. savings account pages
4. personal loan pages
5. credit card pages
6. branch and locator pages
7. downloadable brochures or forms

### Cross-check sources
1. BanksBD.org
2. selected public comparison portals
3. internal manual verification notes

## Product entities to collect

- institution
- product
- product category
- rate record
- fee record
- source record
- verification record
- eligibility checklist
- document checklist
- branch / office / agent location

## Suggested source coverage by product

### Deposits
- Bangladesh Bank official tables first
- then bank-specific product pages for details and variants

### Loans
- bank loan pages
- fee disclosures
- circulars or official notices for policy context
- MFI public publications for formal microcredit references

### Cards
- issuer card pages
- official schedules of charges
- promotional pages only if linked back to official rate/fee documents

### Locator
- Bangladesh Bank agent banking data
- official branch locator pages
- bank branch pages
- public address pages

## Refresh strategy

| Data type | Frequency | Method |
|---|---|---|
| FD / savings rates | monthly | BB table + bank pages |
| DPS | monthly | bank pages |
| personal loans | monthly | bank pages + public circular context |
| credit cards | quarterly with validation | bank pages |
| branch / outlet location | quarterly | BB reports + institution pages |
| macro cards | as published or monthly | public official APIs / releases |
| document checklists | quarterly or change-triggered | institution pages + QA |

## Pipeline stages

1. source discovery
2. crawl fetch
3. parse extraction
4. normalization
5. validation
6. discrepancy detection
7. manual review if needed
8. publication
9. freshness update
10. monitoring and alerting

## Data quality rules

- every published record must have a source URL
- every published record must have a verified or scraped date
- every published record must have a confidence or review status
- discrepancies above threshold should be flagged for manual review
- user-visible freshness badge must be computed from last verified date
- old records may remain for history, but must not appear as current unless verified
- parser confidence should affect publication status

## Change detection

Use content hashing or structured-diff comparison to detect:
- changed rates
- removed products
- changed fees
- changed branch details
- layout changes that may break parsers

## Manual review triggers

- discrepancy above defined rate threshold
- missing mandatory product fields
- parser confidence too low
- official source removed or changed format
- conflict between BB official table and institution page

## Locator dataset minimum fields

- institution name
- institution type
- branch / office / agent name
- district
- upazila
- address text
- latitude
- longitude
- product categories supported
- public phone if available
- source URL
- verified date