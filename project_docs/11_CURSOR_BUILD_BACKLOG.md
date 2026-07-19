# \# Cursor Build Backlog

# 

# \## Purpose

# 

# This file tells Cursor how to build the project in practical, low-risk slices. The rule is simple: deliver small working increments and keep the app runnable after every task.

# 

# \## Delivery style

# 

# \- build in thin vertical slices

# \- avoid broad refactors

# \- define contracts before wiring UI

# \- prefer deterministic logic for numbers

# \- prefer retrieved records for product facts

# \- add tests where logic is non-trivial

# \- update docs when schema or API changes

# 

# \## Recommended repo structure

# 

# \- apps/web

# \- apps/api

# \- packages/shared

# \- packages/calculators

# \- packages/ui

# \- infra

# \- docs

# 

# \## Sprint 1: Foundation

# 

# \### Goal

# Create the runnable base for web, API, shared schemas, and storage.

# 

# \### Tasks

# 1\. Create monorepo structure.

# 2\. Scaffold Next.js app with Bangla-ready layout.

# 3\. Scaffold FastAPI app with modular routers.

# 4\. Add PostgreSQL connection and migrations.

# 5\. Add Redis connection and env management.

# 6\. Add shared types/schemas package.

# 7\. Add basic nav for core routes.

# 8\. Add privacy statement to app shell.

# 

# \### Done when

# \- web app runs

# \- API runs

# \- DB migrations run

# \- shared types compile

# \- nav works across placeholder pages

# 

# \## Sprint 2: Comparison foundation

# 

# \### Goal

# Get comparison data flowing end to end.

# 

# \### Tasks

# 1\. Implement institution, product, rate, fee, and source models.

# 2\. Build seed or ingestion-ready data layer.

# 3\. Build `GET /api/products/compare`.

# 4\. Build comparison page UI.

# 5\. Add filter and sort controls.

# 6\. Add source and freshness badges.

# 7\. Add mobile-friendly result cards.

# 

# \### Done when

# \- comparison page returns real structured records

# \- product cards show source and last verified date

# \- mobile filters and sorting work

# 

# \## Sprint 3: Loan checker integration

# 

# \### Goal

# Integrate the existing calculator into the new platform shell.

# 

# \### Tasks

# 1\. Move or wrap the existing loan calculator into shared logic.

# 2\. Build loan input flow.

# 3\. Build deterministic calculation outputs.

# 4\. Add results card with total repay, extra paid, and cost band.

# 5\. Add compare CTA into comparison flow.

# 6\. Add tests for core calculator logic.

# 

# \### Done when

# \- single-loan flow works end to end

# \- multi-loan support has clear path or initial implementation

# \- no sensitive raw values are stored server-side

# 

# \## Sprint 4: Assistant MVP

# 

# \### Goal

# Ship a useful text assistant that routes into platform tools.

# 

# \### Tasks

# 1\. Build `POST /api/assistant/message`.

# 2\. Implement rule-first intent routing.

# 3\. Add response templates for:

# &#x20;  - loan assessment

# &#x20;  - product comparison

# &#x20;  - nearest provider

# &#x20;  - checklist guidance

# &#x20;  - out-of-scope redirect

# 4\. Build chat UI with suggested prompts.

# 5\. Add disclaimer footer on every reply.

# 6\. Add structured payload rendering for result cards.

# 

# \### Done when

# \- assistant handles core text scenarios

# \- responses are useful and safe

# \- every response has disclaimer

# \- product and numeric outputs come from trusted layers only

# 

# \## Sprint 5: Locator and checklists

# 

# \### Goal

# Enable guided “where to go” and “what to bring” flows.

# 

# \### Tasks

# 1\. Implement location schema and indexes.

# 2\. Build `GET /api/locations/search`.

# 3\. Build `GET /api/checklists`.

# 4\. Add locator page and card UI.

# 5\. Add assistant integration for nearest provider.

# 6\. Add assistant integration for checklist response cards.

# 

# \### Done when

# \- district/upazila search works

# \- assistant can show nearest results

# \- checklists are linked to institutions and categories

# 

# \## Sprint 6: Financial Health and Accounting

# 

# \### Goal

# Connect the guidance layer and local money tracking tools.

# 

# \### Tasks

# 1\. Build or integrate health assessment flow.

# 2\. Keep outputs signal-based, not advisory.

# 3\. Integrate accounting tool in simplified consumer UX.

# 4\. Add local persistence for accounting.

# 5\. Add export if already available.

# 6\. Add routing from assistant into health and accounting tools.

# 

# \### Done when

# \- users can complete a short health flow

# \- users can store cashbook entries locally

# \- assistant can point users into these tools

# 

# \## Sprint 7: Voice layer

# 

# \### Goal

# Make the assistant accessible to low-literacy mobile users.

# 

# \### Tasks

# 1\. Add microphone button and UI states.

# 2\. Add speech-to-text integration for supported environments.

# 3\. Add transcript preview before submit.

# 4\. Add transcript edit support.

# 5\. Add response audio playback.

# 6\. Add confirmation for improbable numeric values.

# 

# \### Done when

# \- user can speak, review, and submit

# \- assistant responds in text

# \- audio playback works where enabled

# \- fallback to typing is smooth

# 

# \## Sprint 8: Data pipelines

# 

# \### Goal

# Automate refresh and quality control.

# 

# \### Tasks

# 1\. Create scraper project structure.

# 2\. Implement Bangladesh Bank table ingestion first.

# 3\. Add institution page crawling for priority banks.

# 4\. Normalize data into schema.

# 5\. Add discrepancy and confidence rules.

# 6\. Add freshness metadata updates.

# 7\. Add scheduled jobs.

# 8\. Add monitoring and failure alerts.

# 

# \### Done when

# \- data refresh works on schedule

# \- freshness badges update

# \- failures are visible internally

# 

# \## Sprint 9: Analytics and trust

# 

# \### Goal

# Track usage safely and improve trust messaging.

# 

# \### Tasks

# 1\. Implement privacy-safe binned analytics endpoint.

# 2\. Add analytics events across key flows.

# 3\. Add trust messaging components.

# 4\. Add privacy explainer screens.

# 5\. Add internal metrics dashboard later if needed.

# 

# \### Done when

# \- analytics contain no raw sensitive values

# \- key events are measurable

# \- privacy promises are visible and accurate

# 

# \## Sprint 10: Polish and pilot readiness

# 

# \### Goal

# Prepare for real-user validation.

# 

# \### Tasks

# 1\. Improve Bangla copy across flows.

# 2\. Improve empty, loading, and error states.

# 3\. Improve accessibility and contrast.

# 4\. Optimize performance for low-end devices.

# 5\. Clean placeholder content.

# 6\. Create pilot walkthrough scenario.

# 7\. Prepare partner demo build.

# 

# \### Done when

# \- pilot users can complete core journeys

# \- interface feels trustworthy and simple

# \- demo is stable and presentation-ready

# 

# \## Task template for Cursor

# 

# When implementing any task, follow this structure:

# 

# 1\. Restate the feature in one sentence.

# 2\. List impacted files.

# 3\. Implement the smallest working slice.

# 4\. Add tests if logic changed.

# 5\. Summarize:

# &#x20;  - what changed

# &#x20;  - risks

# &#x20;  - next step

# 

# \## Never-do list

# 

# \- never hardcode fake bank data in production paths

# \- never use LLM output as the source of truth for rates or fees

# \- never save raw financial form contents to logs

# \- never hide sponsorship or ranking logic

# \- never ship assistant replies without disclaimer

# \- never introduce login dependency into Phase 1 core flows unless explicitly approved

