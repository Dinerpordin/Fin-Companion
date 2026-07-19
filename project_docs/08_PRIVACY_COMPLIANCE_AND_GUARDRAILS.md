# Privacy, Compliance, and Guardrails

## Phase 1 regulatory position

The platform operates as an information and comparison service in Phase 1. It is not a lender, not an advisor, and not a transaction processor.

## Core compliance rules

- no personalised financial advice
- no raw loan or health inputs stored server-side in Phase 1
- no mandatory account creation in Phase 1
- no unnecessary identity data collection
- clear consent language for any user-provided data
- strong data minimisation by default
- transparent product sourcing and freshness indicators
- clear separation between factual comparison and recommendation

## Sensitive data handling

### Must not store in Phase 1
- raw income values
- raw loan inputs
- raw debt details
- raw savings inputs
- full conversation transcripts by default
- NID numbers
- bank account numbers
- unnecessary contact details

### Allowed in privacy-safe form
- rotating session id
- intent class
- tool used
- amount band
- cost band
- purpose band
- region type
- timestamp

## Document flow rules

- prefer client-side document preparation where possible
- if server-side file generation is required, auto-delete within 2 hours
- do not retain personal application data beyond the temporary generation window
- show neutral disclaimer on generated forms and checklists

## Assistant guardrails

### Input guardrails
- detect and strip likely PII where possible
- reject out-of-scope or high-risk requests
- ask clarifying questions when required financial fields are missing
- never assume personal details not provided

### Output guardrails
- never say “you should choose this”
- never say “this is best for you”
- never promise approval
- never invent rates, fees, or branches
- always use deterministic logic for amounts
- always use retrieved verified records for product facts
- always append a non-advisory disclaimer

## Safe wording examples

- Here are published options matching your filters.
- Based on the numbers you entered, the estimated total repay is...
- The nearest listed provider is...
- Typical documents may include...
- I can compare options, but I cannot tell you which one you personally should choose.

## Unsafe wording examples

- I recommend this loan.
- You should take this product.
- This is definitely the best for you.
- You will be approved.
- This lender is perfect for your situation.

## Logging rules

### Allowed
- anonymised binned analytics
- service health logs
- parser errors
- discrepancy flags
- non-sensitive operational metrics

### Not allowed
- raw calculator submissions in logs
- full user financial text in server logs
- persistent transcripts by default
- hidden tracking that conflicts with privacy claims

## Manual review rules

Review must exist for:
- source discrepancies
- parser failures
- freshness failures
- hallucination incidents
- guardrail failures
- user complaints about data accuracy

## User-facing privacy messaging

Use simple language such as:
- Your numbers stay on your phone.
- We show public product information with source and last verified date.
- This tool gives information, not personal financial advice.
- We collect only limited anonymous usage signals to improve the service.