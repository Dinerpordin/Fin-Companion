# UI and UX Specification

## UX goals

- feel safe
- feel simple
- feel useful in the first minute
- work on low-end Android devices
- reduce typing and form burden
- present amounts and time before percentages

## UX principles

- Bangla-first by default
- plain language over jargon
- mobile-first layout
- privacy cues visible at key moments
- non-judgmental tone
- clear next action after every result
- low-clutter design for low-literacy and first-time users

## Primary navigation

### Main tabs
- Check Loan
- Compare
- Health
- Cashbook
- AI Companion

### Secondary routes
- Locator
- Documents
- Best Rates
- Privacy

## Home page

The home page should make the core value obvious in one screen.

### Recommended home cards
1. Check my loan
2. Compare better options
3. Track my money
4. Talk or speak to AI Companion

### Supporting content
- visible privacy statement
- trust note about sources and freshness
- optional Bangla explainer snippets
- simple examples of what users can ask

## Loan checker experience

### Entry
- short intro
- minimal fields
- examples beside difficult inputs
- optional helper text in Bangla

### Results
- total repay first
- extra paid second
- cost band third
- time remaining
- compare better options CTA
- plain-language explanation

### UX rules
- avoid dense tables as the first result
- show BDT amounts prominently
- use warning colors carefully, without shame or fear

## Comparison experience

### Page structure
- category selector
- filter row
- sort row
- result cards
- source and freshness metadata

### Product card anatomy
- institution name
- product name
- key rate or fee
- tenor and amount range
- Islamic flag if relevant
- source
- last verified date
- official link
- nearest / documents CTA where relevant

### Ranking rules
- explain sorting label clearly
- no hidden promotion
- future sponsored results must be labelled

## AI Companion UI

### Mobile layout
- full-screen chat on mobile
- sticky microphone button
- sticky text input area
- suggested prompts on first load
- structured result cards inside chat

### Message design
- short direct answer first
- expandable detail below
- disclaimer on every reply
- button row when relevant:
  - Compare
  - Nearest
  - Documents
  - Try Scenario

### Suggested prompts
- Amar loan ta asole koto porche?
- Kon bank-e bhalo FD rate ache?
- Amar kache kothay bank ache?
- Personal loan nite ki lagbe?
- Jodi ami mash-e 1000 taka beshi dei?

## Voice experience

### Flow
1. user taps mic
2. recording animation starts
3. transcript preview appears
4. user edits or confirms
5. assistant replies in text
6. user can tap audio playback

### Rules
- always show transcript before sending
- confirm improbable numeric values
- provide easy fallback to typing
- do not auto-submit unclear speech

## Locator experience

### Input options
- district
- upazila
- GPS

### Output
- nearest results list first
- optional map second
- institution type
- product support
- address
- distance if location available
- documents CTA if available

## Accessibility requirements

- Bangla default
- large tap targets
- strong contrast
- readable number formatting
- low-clutter screens
- no unexplained financial jargon
- voice option where useful
- empty and error states in plain language

## Content tone

- respectful
- neutral
- practical
- non-judgmental
- factual
- calm
- supportive without sounding advisory