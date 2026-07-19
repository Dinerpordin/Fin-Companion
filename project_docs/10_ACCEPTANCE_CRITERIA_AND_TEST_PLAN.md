# \# Acceptance Criteria and Test Plan

# 

# \## Purpose

# 

# Define what must be true before a feature is considered releasable, and define the minimum testing required for a privacy-first financial product serving Bangladesh users.

# 

# \## Release-wide acceptance criteria

# 

# \- core flows work without login in Phase 1

# \- no raw sensitive financial inputs are stored server-side

# \- all product displays show source and last verified date

# \- Bangla-first UI is present across core flows

# \- mobile UX works well on low-end Android form factors

# \- assistant replies always include a non-advisory disclaimer

# \- deterministic calculators are used for all numeric loan outputs

# \- retrieved records are used for all product facts

# 

# \## Module acceptance criteria

# 

# \### 1. Loan Reality Checker

# 

# A release is acceptable when:

# \- the user can complete a single-loan check

# \- the user can complete a multi-loan scenario

# \- total repay is shown

# \- total extra paid is shown

# \- cost band is shown

# \- time remaining is shown

# \- output is presented in BDT and time first

# \- compare CTA opens a relevant comparison view

# \- no raw inputs are sent to the server in Phase 1

# 

# \### 2. Product Comparison Hub

# 

# A release is acceptable when:

# \- users can compare at least FD, DPS, and personal loan products

# \- filtering works on mobile

# \- sorting works clearly and consistently

# \- each product card shows source URL or source reference

# \- each product card shows last verified date

# \- stale or low-confidence records are not shown as fully verified

# \- ranking logic is not misleading

# 

# \### 3. Financial Health Assessment

# 

# A release is acceptable when:

# \- users can complete a short assessment flow

# \- outputs are signals, not advice

# \- next-step guidance routes to a relevant tool

# \- no raw sensitive assessment values are stored server-side

# 

# \### 4. Free Accounting Tool

# 

# A release is acceptable when:

# \- users can add income and expense entries

# \- entries persist locally after refresh

# \- summaries work for at least one time range

# \- export works if enabled

# \- there is no default server sync in Phase 1

# 

# \### 5. Locator

# 

# A release is acceptable when:

# \- users can search by district or upazila

# \- GPS lookup works when permitted

# \- nearest results return valid institution information

# \- location cards show institution type and key details

# \- document or product support info appears where available

# 

# \### 6. Document Checklist / Pack

# 

# A release is acceptable when:

# \- users can retrieve a checklist for supported products

# \- checklists are clearly institution-linked

# \- free guidance is usable without login

# \- if server-side generation exists, file expiry/deletion rules are enforced

# 

# \### 7. AI Financial Companion

# 

# A release is acceptable when:

# \- the assistant routes correctly across major supported intents

# \- loan answers use deterministic calculator output

# \- product answers use verified records only

# \- nearest provider answers use location data only

# \- every reply contains a disclaimer

# \- transcript preview exists before voice submit

# \- unsupported advisory requests are redirected safely

# 

# \## Test strategy

# 

# Testing must cover:

# \- deterministic business logic

# \- retrieval and API contracts

# \- privacy rules

# \- UX flows on mobile

# \- guardrail behavior

# \- data quality and freshness behavior

# 

# \## Test layers

# 

# \### Unit tests

# 

# Required for:

# \- loan calculator functions

# \- scenario planner calculations

# \- ranking and filter helpers

# \- parser normalization logic

# \- discrepancy flag rules

# \- guardrail wording filter helpers

# \- intent router helper functions

# 

# \### Integration tests

# 

# Required for:

# \- comparison API to database queries

# \- assistant to calculator integration

# \- assistant to comparison API

# \- assistant to locator API

# \- assistant to checklist API

# \- scraper parse-to-publish pipeline

# \- analytics event validation

# 

# \### End-to-end tests

# 

# Required for:

# \- user checks a current loan and opens better options

# \- user compares FD or DPS results

# \- user asks for nearest provider

# \- user requests documents needed

# \- user uses assistant voice flow and confirms transcript

# \- user sees a disclaimer after each assistant response

# 

# \## Data QA checks

# 

# The release must verify:

# \- source metadata exists for published products

# \- last verified date exists for published products

# \- discrepancy flags trigger when expected

# \- low-confidence records are not silently promoted

# \- changed source pages are detected by pipeline monitoring

# 

# \## Privacy QA checks

# 

# The release must verify:

# \- no raw loan data appears in server logs

# \- no raw health assessment data appears in logs

# \- no persistent transcript storage exists by default

# \- rotating session IDs work for analytics

# \- any temporary document files are deleted on expiry

# \- UI privacy statements match actual system behavior

# 

# \## Voice QA checks

# 

# If voice is enabled, verify:

# \- microphone permission handling

# \- transcript preview before send

# \- user can edit transcript

# \- improbable values trigger confirmation

# \- failure falls back cleanly to typing

# 

# \## Performance checks

# 

# At minimum verify:

# \- core pages load acceptably on mobile

# \- comparison results are usable under weak network conditions

# \- assistant input remains responsive

# \- large result sets degrade gracefully

# \- no major blocking scripts hurt first interaction

# 

# \## Manual exploratory checks

# 

# Run manual checks for:

# \- Bangla readability

# \- error copy clarity

# \- empty states

# \- edge-case numeric inputs

# \- non-judgmental tone

# \- source freshness visibility

# \- advisory language leaks

# 

# \## Definition of done

# 

# A feature is done only if:

# \- it works

# \- it has loading, empty, and error states

# \- it respects privacy rules

# \- it is tested at the right level

# \- it does not break existing flows

# \- it is documented if contract or schema changed

