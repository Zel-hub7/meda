# Ticket #52 — Frontend Technical Proposal
**Zelalem — Frontend Lead, Catalog/Ontology Pair**

---

## How I See This

After reading the spec twice, the core insight is straightforward: this is a linear state machine with four stops. Every screen is a state, every user action is a transition, and the only branching logic is whether Screen 3 shows up at the end (anonymous) or not (named). Everything else — branding, consent, auto-save, i18n, pause/resume — is cross-cutting concern layered on top of that simple skeleton.

The temptation with a spec this detailed is to build something equally detailed. I want to resist that. The flow is fundamentally simple — the complexity lives in the edge cases (save failures, resume hydration, consent re-prompt), and those are best handled by solid services, not clever component hierarchies.

---

## Architecture Overview

### The Shell

The assessment shell is its own world — completely separate from the participant shell. No shared layout component, no nav, no breadcrumb. It's a standalone Angular component that wraps every screen:

```
AssessmentShellComponent
├── header: wordmark (left) | assessment title (center) | pause icon (right)
├── <router-outlet>  ← screens render here
└── footer: © {year} apexdynamics.io LLC
```

The shell loads branding tokens once on init (wordmark URL, primary/secondary colors, assessment_title_style) and binds them as CSS custom properties on the host element. Every child component just references `var(--primary-action-color)` etc. No prop drilling, no branding service injected into every component. One place sets the theme, everything inherits.

The pause icon lives in the shell, not in individual screens. The shell hides it conditionally when the route is `contact-details` (Screen 3). One `*ngIf` tied to the active route, done.

### The Flow — Router-Driven State Machine

Each screen is a route under a lazy-loaded assessment module:

```
/assess/:token
  ├── /consent        (Screen 0 — always first)
  ├── /intro          (Screen 1)
  ├── /question/:pos  (Screen 2 — parameterized by position)
  ├── /complete       (completion landing)
  └── /contact        (Screen 3 — anonymous only)
```

Route guards do the heavy lifting:

- **ConsentGuard** (`canActivate` on `/intro`, `/question`, `/complete`, `/contact`): checks if consent has been accepted in the current session. If not, redirects to `/consent`. This is the architectural enforcement of the "consent every session" rule — it's not a UI check, it's a navigation gate. Even if someone tries to manually type `/question/50` in the URL bar, the guard catches it.

- **CompletionGuard** (`canActivate` on `/contact`): only allows navigation to contact details if the assessment is actually completed AND the participant is anonymous. Named participants hitting this route get redirected to `/complete`.

- **AssessmentResolver** (`resolve` on the parent `/assess/:token`): fires once on entry. Fetches the assessment config (metadata, branding, question count, scale config, progress segments) AND the in-progress state if resuming. Stores everything in `AssessmentStateService`. Every child route can inject the service and read hydrated state without re-fetching.

The resolver is the single network call on entry. The consent screen, intro screen, and first question screen all render from already-loaded data. No loading spinners between screens.

### The Screens

**ConsentComponent (Screen 0)**

Receives the cascade config from `AssessmentStateService` — an array of 1, 2, or 3 consent items, each with a tier, display name, and URL. Renders them with `*ngFor`. Each checkbox is a standalone form control tracking its own `checked` state and `accepted_at` timestamp (captured on click, not on form submit).

The CTA button binds `[disabled]="!allChecked()"`. When clicked, fires all consent records to the backend in a single batch POST (one record per checkbox, each carrying its own timestamp). On success, marks the session as consented in `AssessmentStateService` and navigates to `/intro`.

No template-driven forms here. Reactive forms are overkill for checkboxes. Simple component state with a clean submit handler.

**IntroComponent (Screen 1)**

The simplest component. Renders the assessment description from state. The CTA label switches between the configured start label and a localized "Continue" based on whether `AssessmentStateService.resumePosition` exists.

On click, navigates to `/question/1` for fresh starts or `/question/{resumePosition}` for resumes.

**QuestionComponent (Screen 2)**

This is where 90% of the UX complexity lives.

The component is parameterized by `:pos` in the route. On route param change (not component re-init — Angular reuses the component instance for param changes by default, which is what we want), it:

1. Loads the question at position `pos` from the pre-fetched question set
2. Loads any existing answer from state (for back-navigation or resume)
3. Resets the timing clock (`performance.now()`)
4. Renders the Likert scale

The Likert scale is its own component (`LikertScaleComponent`) — a `role="radiogroup"` container with N radio circles. It accepts `scaleLength`, `extremeLabelLow`, `extremeLabelHigh`, and `selectedValue` as inputs, emits `(selected)` with the chosen value. Keyboard handling (arrow keys to navigate, Space/Enter to select) lives inside this component. Accessible names are computed internally: first circle gets `"{position} of {total}, {extremeLabelLow}"`, last gets the high label, middle ones get position only.

On selection, the component doesn't just emit — it calls `AutoSaveService.save(questionId, value, secondsElapsed)`. This returns an Observable. The component subscribes:
- On next (success): enables the forward arrow, updates local state
- On error: shows the non-blocking "Saving..." notice, `AutoSaveService` handles retry internally

The forward/back arrows are simple:
- Back: `router.navigate(['../', pos - 1])`, disabled at pos === 1
- Forward: `router.navigate(['../', pos + 1])`, disabled until save confirmed
- At last question: forward becomes Submit, triggers `AssessmentFlowService.complete()`

**ContactDetailsComponent (Screen 3)**

Reactive form with 4 controls, all required, email gets `Validators.email`. Standard stuff. The interesting parts:

- On submit with new email: backend creates account, returns session token, `AuthService` swaps the token in-place (no redirect to login page, session continues seamlessly)
- On submit with existing email: backend returns a 409 (or equivalent), component opens a modal with login form. On successful login, same token swap.
- The "Zurück" link just navigates to `/complete`. No data loss because the assessment is already done.

### Key Services

**AssessmentStateService**

The brain. Holds:
- Assessment config (metadata, branding, questions, scale config, consent cascade)
- Session state (consented: boolean, current position, answers map, resume position)
- Participant context (named vs anonymous, participant ref)

Populated once by the resolver. Mutated by consent acceptance, answer saves, and completion. This is a plain injectable singleton — no NgRx, no state management library. The flow is linear with no concurrent state mutations. A BehaviorSubject for reactive bits where templates need to subscribe (like the progress bar), simple properties for everything else.

I'm deliberately not reaching for NgRx here. The state shape is small, mutations are sequential, and there's exactly one consumer per piece of state. A state management library would add ceremony without solving a real problem.

**AutoSaveService**

Wraps HttpClient. Exposes `save(questionId, value, secondsElapsed): Observable<void>`.

Internally:
- Fires the POST
- On HTTP error: retries with `retryWhen` using exponential backoff (1s, 2s, 4s), max 3 attempts
- Exposes a `saving$: BehaviorSubject<boolean>` that the shell can subscribe to for the "Saving..." indicator
- On exhausted retries: emits through an `error$` subject that the question component catches

Simple RxJS. No queue, no optimistic updates, no offline buffer. The spec explicitly says no fire-and-forget — we wait for server confirmation. So the pipe is: POST → retry on fail → success or error. Linear.

**ConsentService**

Handles the batch POST of consent records. Each record carries its own `accepted_at` timestamp (captured at checkbox click time, not POST time). Also computes `url_hash` client-side (SHA-256 of the URL string) so the backend can store it alongside the server-computed hash for cross-verification.

**TimingService**

Dead simple. `startTimer()` called on question render, `elapsed(): number` called on answer selection. Uses `performance.now()` for precision. No intervals, no subscriptions. Two methods.

### Branding

The resolver fetches branding tokens as part of the assessment config. The shell component sets them as CSS custom properties on its host element:

```css
:host {
  --primary-action-color: ...;
  --secondary-action-color: ...;
  --assessment-title-font: ...;
  --assessment-title-weight: ...;
  --assessment-title-color: ...;
}
```

Every child component styles against these variables. The Likert selected state, progress bar segments, CTA buttons, checkbox ticks — all reference `var(--primary-action-color)`. Zero hardcoded colors.

The wordmark is an `<img>` with `[src]` bound to the branding config URL. `assessment_title_style` is applied as `[ngStyle]` on the title element in the shell header.

### i18n

Assessment content (questions, descriptions, labels, CTA text) comes from the backend already in the correct language — the language was locked at invitation time. No client-side translation needed for assessment content.

Shell chrome strings (button labels, tooltips, error messages, accessibility announcements) need translation across de/en/nl/fr. Angular's built-in i18n with `$localize` and compile-time translation works, but means four separate builds. For 20-30 shell strings, I'd lean toward a runtime approach: a small translation map loaded as part of the assessment config, keyed by string ID. The shell components reference `translationService.get('pause.tooltip')`. This keeps us on a single build artifact regardless of language.

The `<html lang="...">` attribute is set once by the shell on init, pulled from the assessment config language field.

### Browser Back Trap

Angular's `CanDeactivate` guard on every route in the assessment module. When the guard fires, it opens a confirmation dialog (a simple modal component, not `window.confirm` — we need it styled and keyboard-accessible). Cancel returns `false` (stay), Leave returns `true` (navigate away).

We also push a dummy history state on shell init (`history.pushState`) so the browser back button triggers Angular's navigation cycle rather than leaving the SPA entirely. This is a well-known pattern — single push on init, the `CanDeactivate` guard handles the rest.

### Accessibility

Not treating this as a separate section bolted on at the end — it's baked into each component:

- Likert: `role="radiogroup"`, `role="radio"` per circle, `aria-checked`, composite `aria-label` per circle, arrow key navigation handler
- Progress bar: `role="progressbar"`, `aria-valuenow`/`aria-valuemax`, `aria-label="Step {k} of {n}"`
- Consent checkboxes: native `<input type="checkbox">` (not div-with-click-handler), `aria-checked`, associated `<label>` with the full differentiated text
- Disabled CTA/forward arrow: `aria-disabled="true"` + `aria-describedby` pointing to a visually-hidden reason span
- Modals: focus trap, `role="dialog"`, `aria-modal="true"`, return focus on close
- All interactive elements: visible focus ring via `:focus-visible`

Plan to run axe-core in integration tests on every screen variant (consent with 1/2/3 checkboxes, question with different scale lengths).

---

## What I Need From Backend (Dhaval)

This is the API contract conversation I want to have early:

**1. Assessment entry endpoint**
`GET /api/assessments/:token/init`
Returns: assessment config (metadata, branding tokens, consent cascade, question set or question count, scale config, progress segment definitions) + in-progress state if exists (current position, existing answers map, participant context).

This is the single call the resolver makes. I need everything in one payload to avoid waterfalling.

**2. Consent batch POST**
`POST /api/assessments/:token/consent`
Body: array of consent records (tier, accepted_at, url, url_hash, etc.)
Returns: 201 on success.

**3. Answer save**
`POST /api/assessments/:token/answers/:questionId`
Body: { value, seconds_to_answer }
Returns: 200 on success. Must be idempotent (retries send the same payload).

**4. Completion**
`POST /api/assessments/:token/complete`
Returns: 200 + { participant_type: 'named' | 'anonymous' } so the frontend knows which post-completion path to take.

**5. Contact details submit**
`POST /api/assessments/:token/contact`
Body: { email, name, company_name, phone }
Returns: 201 + new session token for new accounts, 409 for existing email.

**6. Inline login (existing email case)**
`POST /api/auth/login`
Standard login, returns session token. Frontend swaps it in.

The question set can either come in full on init (if question count is reasonable — 174 questions with text and labels is maybe 50-80KB, totally fine in one payload) or paginated. I'd argue for full upfront load: it removes network dependency during the actual taking experience and eliminates per-question loading spinners. Worth discussing with Dhaval.

---

## Risks and Open Questions

1. **Question payload size**: 174 questions upfront vs. paginated. I'm leaning full load but need to validate with realistic payload size. If assessments can have 500+ questions in future, we'd need pagination.

2. **Session token lifecycle for anonymous flow**: the magic link token authenticates the session, but on account creation (Screen 3) we swap to a real auth token. Need to coordinate the token transition mechanics with Dhaval so there's no gap where requests fail.

3. **Concurrent answer saves**: if a participant clicks circle 5, then immediately clicks circle 6 before the first save returns — do we cancel the in-flight request or let both complete? I'd cancel the first (switchMap semantics), since the backend's append-only model means both would be recorded anyway. But the forward arrow should only enable on the final save's success.

4. **Browser back trap limitations**: `CanDeactivate` + `pushState` works for the back button but cannot intercept tab close or browser close. The spec acknowledges this ("cannot prevent a determined user from leaving; auto-save ensures no loss"). Just flagging it.

5. **Assessment title style token**: the spec introduces `assessment_title_style` as a new per-ISV token with font-family, weight, color, letter-spacing. Need to confirm the exact schema from whoever manages the branding config, and ensure any custom fonts are either system fonts or pre-loaded.

6. **Figma design availability**: pixel-perfect UI implementation requires finalized Figma designs for all four screens and their state variants (consent with 1/2/3 checkboxes, Likert at different scale lengths, progress bar at various stages, disabled/enabled CTAs, error states, pause confirmation, browser-back dialog). Any design iteration after development starts will require rework time.

---

## Developer Estimate

**Complexity:** XL

**Estimated effort:** 80–110 hours (10–14 working days at 8 hours/day)

### Phase Breakdown

| Phase | What | Hours | Days |
|-------|------|-------|------|
| **Phase 0 — Onboarding & Codebase Familiarization** | Clone repo, set up local dev environment, read existing code structure, understand existing patterns/conventions, identify reusable components and services, understand the auth flow, understand the existing participant shell architecture | 8–10 | 1–1.5 |
| **Phase 1 — API Exploration & Contract Validation** | Coordinate with Dhaval on API contract, test each endpoint manually (Postman/Insomnia), verify response structures match frontend expectations, document any gaps or mismatches, confirm error response shapes for retry/error handling logic | 6–8 | 1 |
| **Phase 2 — UI Development (Figma to Code)** | Pixel-perfect implementation of all four screens from Figma designs, assessment shell layout, responsive card layouts, progress bar, Likert circle component, consent checkbox styling, contact details form, completion landing, pause confirmation screen, all hover/focus/active/disabled states, branding token integration with CSS custom properties | 28–36 | 3.5–4.5 |
| **Phase 3 — Business Logic & Services** | Router setup with guards (ConsentGuard, CompletionGuard), resolver for upfront data fetch, AssessmentStateService (session state management), AutoSaveService with retry logic, ConsentService with per-checkbox timestamps and URL hashing, TimingService for per-question timing, pause/resume flow, completion flow with post-completion routing, anonymous contact details flow (new account, existing email modal, opt-out), browser-back trap (CanDeactivate + pushState) | 20–28 | 2.5–3.5 |
| **Phase 4 — i18n & Accessibility** | Runtime translation service for shell chrome strings (de, en, nl, fr), html lang attribute setting, WCAG 2.1 AA compliance across all screens, Likert radiogroup keyboard navigation and screen reader semantics, disabled-state reason announcements, focus management on modals, axe-core integration in tests, manual keyboard-only walkthrough | 8–12 | 1–1.5 |
| **Phase 5 — Testing** | Unit tests per acceptance scenarios (test_scenario_1 through test_scenario_45), integration tests for end-to-end flows (named participant, anonymous new email, anonymous existing email, pause/resume), consent cascade variants (1/2/3 checkboxes), Likert at various scale lengths (2/5/7/10), auto-save retry and failure scenarios, cross-browser testing for browser-back trap | 10–16 | 1.5–2 |

### Important Assumptions & Dependencies

This estimate is based on the following assumptions. If any of these change, the timeline shifts:

1. **Backend APIs are complete and stable.** The frontend cannot proceed past Phase 2 without working endpoints. Any delays or breaking changes on the API side will directly push the frontend timeline. Phases 0-2 can overlap with backend development, but Phase 3 onward is blocked on API readiness.

2. **Figma designs are finalized.** Pixel-perfect UI work requires stable designs. If designs are still being iterated during development, rework cycles will add time. I need designs for: all four screens, each screen's state variants (disabled buttons, error states, loading states, selected/unselected Likert circles, ticked/unticked checkboxes, progress bar at different stages), the pause confirmation screen, the browser-back confirmation dialog, and the existing-email login modal.

3. **Codebase unknowns.** I don't have repo access yet, so I have no visibility into what existing infrastructure I can reuse — shared component library, design tokens, auth handling, modal/dialog utilities, i18n setup, HTTP interceptors, error handling patterns. If most of this exists and I can reuse it, I'm closer to 80 hours. If I'm building from scratch with no existing patterns to follow, closer to 110 or beyond.

4. **Code review cycles.** The estimate includes writing the code and self-review. It does NOT include time spent in PR review cycles with the team. Depending on review turnaround and how many revision rounds are needed, this could add 1–3 days on top.

5. **Accessibility sign-off.** The estimate includes implementing accessibility and running axe-core. It does NOT include the manual screen reader pass (NVDA + VoiceOver) if that's expected to be done by me rather than a QA specialist. Manual screen reader testing across all screen variants would add 1–2 days.

6. **Single assessment type.** This estimate covers the Likert-only, linear, no-branching flow described in the spec. If requirements expand mid-development (new question types, skip logic, etc.), that's a separate estimate.

### Questions for Owner

1. Is there an existing component library or design system in the frontend codebase, or are UI components built from scratch per feature?
2. Are the Figma designs for this flow finalized and ready, or still in progress?
3. Is there an existing i18n setup and translation workflow, or do I need to establish one?
4. Is there an existing modal/dialog component I can reuse for the browser-back confirmation and the existing-email login modal?
5. Who provides the translation strings for the 4 languages (de, en, nl, fr) — do I get them from a translator, are they in the assessment catalog, or do I write them?
6. For the accessibility sign-off (manual screen reader pass with NVDA + VoiceOver) — is there a QA person handling this or is that on me?
7. What's the PR review process and expected turnaround? One reviewer or multiple?

---

## Timeline Against May 31 Deadline

**Proposal submitted:** May 13
**Expected approval + repo access:** May 14–15
**Coding start (realistic):** May 15
**Deadline:** May 31
**Available working days (May 15–31):** ~12–13 weekdays

The 10–14 day estimate fits within the May 31 deadline, but the margin depends heavily on how quickly the dependencies land. Here's how I see it mapped to actual dates:

**May 15–16 (Days 1–2) — Phase 0 + Phase 1: Onboarding & API Exploration**
- Clone repo, local environment setup, read codebase, understand existing patterns
- Coordinate with Dhaval, test API endpoints in Postman, validate response shapes
- Identify reusable components, understand auth flow, understand participant shell architecture
- This phase can run in parallel with any remaining backend work — I'm reading, not building

**May 19–23 (Days 3–7) — Phase 2 + Phase 3: UI Development & Core Logic**
- Pixel-perfect Figma implementation of assessment shell + all four screens
- Router skeleton with guards wired, resolver connected
- Question screen + Likert component (the hardest piece — gets priority)
- AutoSaveService with retry logic wired to real endpoints
- Consent screen with cascade rendering and compliance record POSTs
- Intro screen with resume-aware CTA
- Branding tokens flowing through CSS custom properties

**May 26–29 (Days 8–11) — Phase 4 + Phase 5: Completion, Polish, Tests**
- Completion flow + contact details form + account creation + login modal
- Browser back trap across all screens
- i18n shell strings for de, en, nl, fr
- Accessibility pass — axe-core, keyboard walkthrough, ARIA semantics
- Unit tests per acceptance scenarios (test_scenario_1 through 45)
- Integration tests for end-to-end flows
- Cross-browser testing, final cleanup

**May 30 (Day 12) — Buffer**
- Code review revisions, any final fixes, edge case testing

This lands comfortably before May 31 in the 10-day scenario and right at the wire in the 14-day scenario. The critical path items that could push toward 14:

- **Late API readiness from backend** — if endpoints aren't testable by May 19, Phase 3 stalls and everything shifts right
- **Figma design changes mid-development** — rework on pixel-perfect UI burns days fast
- **Extended code review cycles** — if PR reviews take 2+ days per round, the feedback loop eats into the buffer
- **Approval or repo access delays** — every day between now and coding start is a day off the back end

**Bottom line:** the May 31 deadline is achievable if approval and repo access land by May 15, APIs are testable by May 19, and Figma designs are stable. If any of these slip, I'll flag it immediately so we can adjust scope or timeline together.

---

## Build Order

This is the sequence I'd follow once repo access is granted and APIs are available:

**Days 1–2 — Foundation**
1. Codebase onboarding, local environment setup, existing code review
2. API exploration with Dhaval — test endpoints, validate contracts
3. Assessment shell + router skeleton — empty screens, guards wired, resolver stubbed with mock data. Whole flow navigable end to end with fake data.
4. Branding — CSS custom properties flowing from mock config. Verify with two different brand configs (Lencora + Scheelen colors).

**Days 3–7 — Core Experience (Figma to Code + Logic)**
5. Question screen + Likert component from Figma — pixel-perfect UI, the core experience. Accessibility pass here.
6. AutoSaveService — wire real HTTP calls, retry logic, saving indicator.
7. Consent screen from Figma — cascade rendering, per-checkbox timestamps, batch POST.
8. Intro screen — trivial, just needs resume-aware CTA.

**Days 8–11 — Completion, Polish, Tests**
9. Completion + contact details from Figma — post-completion routing, form, account creation flow, login modal.
10. Browser back trap — CanDeactivate + pushState.
11. i18n — translation map for shell strings, `lang` attribute.
12. Integration tests — end-to-end flows per the acceptance scenarios.
13. Cross-browser testing, final accessibility audit, cleanup.

**Day 12+ — Buffer for code review cycles and edge cases.**

The question screen is early (step 5) because it's where participants spend 95% of their time and where all the hard UX problems live. Everything else is a form or a static page.

---

## What's Deliberately Not Here

- **No NgRx / state management library.** The state is too simple and linear. One service with a BehaviorSubject covers it.
- **No component library (Material, PrimeNG, etc.).** The UI components are bespoke to this flow. Pulling in a library for 5 components adds weight without value, and makes pixel-perfect Figma matching harder.
- **No micro-frontend architecture.** This is one module with one concern.
- **No SSR.** This is an authenticated, stateful, interactive flow. Server-side rendering adds complexity with no benefit.
- **No offline/PWA capabilities.** Auto-save handles the reliability concern. Full offline is out of scope and not worth the service worker complexity for F1.
