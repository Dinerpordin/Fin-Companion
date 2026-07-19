# AI Financial Companion PRD

## Purpose

The AI Financial Companion is the conversational access layer for the whole platform. It helps users interact with comparison, loan checking, health assessment, accounting, locator, and document guidance without navigating complex forms.

## Product boundaries

The assistant may:
- explain
- compare
- calculate
- simulate
- locate
- show documents needed
- link to official sources
- present likely options based on filters and published data

The assistant must not:
- give personalised financial advice
- say a specific product is best for the user
- recommend borrowing beyond factual comparison
- collect identity numbers, account numbers, or unnecessary personal data in Phase 1
- invent rates or lender details

## Supported intents

1. existing loan assessment
2. upcoming loan simulation
3. product comparison
4. nearest provider lookup
5. how-to-apply guidance
6. financial health snapshot
7. accounting help
8. general financial education
9. out-of-scope rejection and safe redirect

## Example prompts

- Amar loan ta asole koto porche?
- Ami 50,000 taka nite chai, kemon monthly cost hobe?
- Rajshahi-te kache kon bank-e bhalo personal loan ache?
- DPS khulte ki ki lagbe?
- Amar income 15,000, mash-e loan dite hoy 4,000. Ki obostha?
- Nearest BRAC / ASA / bank branch kothay?
- Jodi ami mash-e 1000 taka beshi dei?
- FD ar DPS er moddhe parthokko ki?

## Core user jobs

### 1. Understand an existing loan
The user describes their current loan in natural language. The assistant extracts the needed fields, confirms them, runs the calculator, and explains the result in plain Bangla.

### 2. Simulate a new loan
The user asks what a possible loan may cost. The assistant collects assumptions, calculates likely repayment outputs, and shows relevant formal comparison options.

### 3. Compare financial products
The user asks for FD, DPS, savings, loan, or card options. The assistant returns filtered, sourced product results with freshness indicators.

### 4. Find the nearest provider
The user provides district, upazila, or GPS. The assistant returns nearby branches, agents, or MFIs that support the relevant category.

### 5. Understand application requirements
The user asks what is needed to apply. The assistant provides a neutral checklist and links to the document pack flow.

### 6. Get a quick financial health signal
The user provides simple income, cost, debt, and savings information conversationally. The assistant returns signal-based outputs and routes to the right next tool.

## Response design

Every answer should try to return:
1. direct answer in plain Bangla,
2. amount and time outputs first,
3. product or provider options if available,
4. source/freshness reference,
5. a next action button,
6. a non-advisory disclaimer.

## UX requirements

### Input modes
- text input
- voice input
- suggested prompts
- quick action chips

### Output modes
- text response
- structured result cards
- optional voice playback
- deep links into tools

### Mobile rules
- full-screen chat on mobile
- microphone-first
- large tap areas
- low-clutter layout
- short paragraphs and obvious next steps

## Voice requirements

- microphone-first on mobile
- transcript preview before submit
- confirm improbable numbers
- text + audio response output
- fallback to typing if voice fails

## Guardrails

### Mandatory behavior
- always use retrieved or calculated facts
- always add disclaimer
- ask clarifying questions for missing required fields
- reject out-of-scope advisory requests safely

### Safe redirection examples
- “I can compare published options for you.”
- “I can estimate the total repayment based on your inputs.”
- “I can show nearby providers and required documents.”
- “I cannot tell you which option you personally should choose.”

## Structured payload expectations

The assistant backend should be able to return:
- intent
- reply text in Bangla
- optional English version
- disclaimer
- next actions
- loan summary block
- comparison options block
- nearest location block
- checklist block
- scenario block

## Acceptance criteria

- complete a current-loan check in under 6 user turns
- complete a basic product comparison in under 4 user turns
- route correctly across the major supported intents
- return nearest provider when district/upazila or GPS is available
- provide a checklist for supported products
- append disclaimer on every response
- store no raw financial figures server-side in Phase 1

## Phase rollout

### MVP
- text chat only
- loan assessment
- product comparison
- nearest provider
- checklist guidance

### V1
- voice input
- voice output
- health snapshot routing
- scenario planner routing

### V2
- WhatsApp channel
- IVR/USSD-lite fallback
- richer multilingual support
- more advanced retrieval and orchestration