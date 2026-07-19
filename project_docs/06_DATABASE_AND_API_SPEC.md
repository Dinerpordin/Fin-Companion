# Database and API Specification

## Database design goals

- keep product facts structured and queryable
- separate products from rates and fees
- preserve source lineage
- support freshness and confidence indicators
- support locator search
- support checklists and assistant retrieval
- keep analytics privacy-safe and binned

## Core tables

### institutions
- id
- name_en
- name_bn
- institution_type
- regulator
- website_url
- phone_public
- is_islamic
- last_verified_at

### products
- id
- institution_id
- category
- name_en
- name_bn
- description_short_bn
- min_amount
- max_amount
- min_tenor_months
- max_tenor_months
- islamic_flag
- official_url
- status

### product_rates
- id
- product_id
- rate_type
- nominal_rate
- effective_notes
- fee_notes
- valid_from
- verified_at
- source_id
- confidence_flag

### product_fees
- id
- product_id
- fee_name
- fee_amount
- fee_type
- notes
- verified_at
- source_id

### source_records
- id
- source_url
- source_type
- scraped_at
- parser_version
- raw_hash
- status

### locations
- id
- institution_id
- location_type
- branch_name
- district
- upazila
- address_text
- latitude
- longitude
- products_supported
- verified_at

### document_checklists
- id
- institution_id
- product_category
- checklist_bn
- checklist_en
- verified_at
- source_id

### analytics_events_binned
- id
- session_id_rotating
- tool_name
- intent_class
- amount_band
- purpose_band
- lender_type
- cost_band
- region_type
- event_month
- created_at

## Indexing suggestions

- index products by category
- index institutions by type and name
- index rates by verified_at and product_id
- add geospatial indexing for locations
- index source_records by source_url and scraped_at
- index analytics by tool_name, intent_class, and event_month

## API principles

- keep sensitive calculations deterministic
- keep product answers retrieval-based
- support Bangla-first responses
- return freshness metadata when product facts are shown
- keep APIs modular and composable for assistant reuse

## Suggested endpoints

### GET /api/health
Simple service health check.

### GET /api/products/compare
Query params:
- category
- amount
- tenor_months
- district
- islamic_only
- sort_by
- limit

Returns:
- matching products
- key rates and fees
- source metadata
- last verified date

### GET /api/products/:id
Returns full product details including source and verification information.

### GET /api/locations/search
Query params:
- district
- upazila
- lat
- lng
- category
- institution_type
- limit

Returns:
- nearest matching locations
- institution details
- supported categories
- verification metadata

### GET /api/checklists
Query params:
- institution_id
- product_category

Returns:
- checklist in Bangla
- optional English
- verified date
- source metadata

### POST /api/loan/calculate
Accepts structured loan inputs and returns deterministic outputs only.

Example request:
```json
{
  "loan_amount": 50000,
  "instalment_amount": 2500,
  "frequency": "monthly",
  "instalment_count": 24,
  "upfront_fees": 1000
}
```

Example response:
```json
{
  "total_repay": 61000,
  "total_extra_paid": 11000,
  "time_remaining_months": 24,
  "cost_band": "high"
}
```

### POST /api/assistant/message
Handles text-based assistant requests.

Example request:
```json
{
  "session_id": "uuid",
  "locale": "bn-BD",
  "message": "Amar loan ta koto porche?",
  "channel": "web_text",
  "context": {
    "district": "Dhaka",
    "upazila": null
  }
}
```

Example response:
```json
{
  "intent": "loan_assessment",
  "reply_text_bn": "আপনার ইনপুট অনুযায়ী মোট পরিশোধ হবে ...",
  "reply_text_en": "Based on your inputs, total repayment is ...",
  "disclaimer_bn": "এটি তথ্য মাত্র, আর্থিক পরামর্শ নয়।",
  "next_actions": [
    { "type": "open_tool", "target": "loan_checker" },
    { "type": "open_comparison", "category": "personal_loan" }
  ],
  "structured_payload": {
    "loan_summary": null,
    "comparison_options": [],
    "nearest_locations": [],
    "checklist": null
  }
}
```

### POST /api/events/binned
Accepts privacy-safe analytics events only.

## Assistant contract rules

- all loan outputs must come from deterministic calculator logic
- all product details must come from verified records
- assistant must return disclaimer every time
- assistant may return structured cards for:
  - loan summary
  - comparison options
  - nearest locations
  - document checklist
  - scenario output

## Privacy rules for API layer

- never persist raw financial inputs from Phase 1 calculator flows
- never store full transcripts by default
- strip or reject unnecessary identifiers
- log only privacy-safe analytics events