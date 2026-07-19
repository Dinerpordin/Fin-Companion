# Technical Architecture

## Architecture principles

- modular and incremental
- client-side sensitive calculations in Phase 1
- server stores public product data and anonymised analytics only
- scheduled refresh for scraped data
- transparent freshness metadata
- mobile-first, offline-tolerant, low-bandwidth aware

## Core stack

### Frontend
- Next.js
- React
- PWA support
- Noto Sans Bengali
- IndexedDB / LocalStorage for local-first features
- browser speech APIs where supported

### Backend
- FastAPI
- Python
- Redis for cache and short-lived session state
- PostgreSQL for structured product, source, checklist, and location data
- Elasticsearch or equivalent for search and filtering
- pgvector or ChromaDB for retrieval-augmented assistant knowledge

### Data collection
- Scrapy for primary crawling
- Playwright for JS-rendered sources
- BeautifulSoup for simple HTML parsing
- PDF parsing where circulars or product sheets are PDF-only
- Airflow for scheduling

### Monitoring and delivery
- Prometheus
- Grafana
- structured logging
- Cloudflare CDN
- AWS or GCP deployment

## High-level system layout

### App layer
The web app provides all user-facing modules:
- home and navigation
- loan checker
- product comparison
- financial health assessment
- accounting tool
- locator
- document guidance
- AI companion

### API layer
The API layer exposes:
- comparison endpoints
- calculator endpoints
- locator endpoints
- document checklist endpoints
- assistant orchestration endpoint
- analytics event endpoint

### Data layer
The data layer stores:
- institutions
- products
- rates
- fees
- source records
- location records
- checklists
- anonymised analytics events

### Pipeline layer
The pipeline layer handles:
- crawl scheduling
- parsing
- normalization
- validation
- discrepancy flagging
- freshness updates
- publication into product tables

## Privacy-first architecture

### Loan checker and health assessment
- calculations run client-side in Phase 1
- raw sensitive values are not sent to server
- only binned analytics events may be logged

### Accounting tool
- local device storage only in Phase 1
- no default cloud sync
- export optional

### Document pack
- where possible, prepare client-side
- if server-side rendering is ever used, auto-delete within 2 hours
- never retain personal application data long-term without later consent architecture

## Assistant architecture

### Processing pipeline
1. capture input from text or voice
2. convert speech to text if needed
3. sanitize input and strip obvious PII
4. classify intent
5. retrieve trusted facts or invoke deterministic tools
6. assemble response
7. run guardrail filters
8. return text plus optional structured result cards
9. render optional audio response

### Assistant design rules
- LLM is not the source of truth for numbers
- product facts must come from retrieved records
- calculations must come from deterministic logic
- all responses include a disclaimer
- unsupported requests are redirected safely

## Deployment approach

### Phase 1
- monorepo acceptable
- single Next.js frontend
- single FastAPI backend with modular routers
- PostgreSQL + Redis
- Airflow-driven scraper jobs
- simple admin or internal review console for data QA

### Later phases
- split assistant orchestration into separate service
- add queue-based background workers
- add multi-channel adapters for WhatsApp and IVR
- add stronger admin tooling and audit flows