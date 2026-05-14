# Ticket #52 — Frontend Technical Proposal

---

## How I See This

After reading the spec twice, the core insight is straightforward: this is a linear state machine with four stops. Every screen is a state, every user action is a transition, and the only branching logic is whether Screen 3 shows up at the end (anonymous) or not (named). Everything else — branding, consent, auto-save, i18n, pause/resume — is cross-cutting concern layered on top of that simple skeleton.

The temptation with a spec this detailed is to build something equally detailed. I want to resist that. The flow is fundamentally simple — the complexity lives in the edge cases (save failures, resume hydration, consent re-prompt, grace-period rejection), and those are best handled by solid services, not clever component hierarchies.

The architecture is dictated by the platform baseline: this is a **federated microfrontend** exposed via Module Federation, consumed by the participant shell on a dedicated route in focused mode. Not a standalone app — a remote module that the shell hosts with its chrome hidden. That contract shapes everything downstream.

---

## Architecture Overview

### Federated MFE — Not a Standalone Shell

Per the spec (§4.1) and baseline Section 6.1, the assessment flow is a **federated MFE** in `velocity-frontend-assessment`, exposed via Module Federation and consumed by the participant shell (`velocity-frontend-identity`). The participant shell mounts the MFE on a dedicated route and switches to a "focused" layout — hiding its own chrome (nav, breadcrumb, user menu, tenant switcher, credit badge) for that route.

The MFE renders its own focused chrome inside the shell's viewport:

```
AssessmentMfeComponent (remoteEntry exposed via Module Federation)
├── header: wordmark (left) | assessment title (center) | pause icon (right)
├── <router-outlet>  ← screens render here
└── footer: © {year} apexdynamics.io LLC
```

Key distinction: the participant shell is still running — it owns the JWT, the branding singleton, and the route. The MFE is a guest inside that host. It does NOT bootstrap its own Angular app, it does NOT query Tenant Service, it does NOT manage its own auth token.

What the MFE owns: the 4 screens, focused chrome (wordmark display, title, pause icon, footer), all assessment-specific state and API calls.

What the shell owns and the MFE consumes: JWT (authentication context), branding singleton (visual tokens + assets), route activation.

### Branding — Consumed From Shell Singleton, Not Fetched

Per baseline Section 5.1, Tenant Service owns branding. Per Section 6.1, the participant shell queries Tenant Service for the active tenant's branding and exposes it as a **singleton via Module Federation** (`shareScope: 'default'`).

The assessment MFE reads from that singleton on init. It does NOT call Tenant Service. It does NOT fetch branding from the backend.

What the MFE consumes from the singleton:

- **Tenant wordmark** — asset URL (Azure Blob Storage, served by Tenant Service)
- **`primary_action_color`** — selected circles, CTAs, progress bar active segment, ticked checkboxes
- **`secondary_action_color`** — secondary interactive elements
- **`assessment_title_style`** — font-family, weight, color, letter-spacing for the assessment title in top-center

The MFE component binds these as CSS custom properties on its host element:

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

The wordmark is an `<img>` with `[src]` bound to the singleton's asset URL. `assessment_title_style` is applied as `[ngStyle]` on the title element in the MFE header.

If the flow requires a token that doesn't exist in the branding catalog today (e.g., `assessment_title_style`), the migration is delivered by Tenant Service — this story only declares the requirement and consumes the resolved value.

### JWT — Shell-Owned, MFE-Consumed

Per baseline Section 6.1, the JWT follows the same pattern as branding: the participant shell owns it, exposes it via Module Federation shared scope, and the MFE consumes it. The MFE attaches the JWT to every API call (auto-save, consent POST, completion, contact details) via an HTTP interceptor that reads from the shared auth context.

For magic-link entry: the shell resolves the magic-link token into a session JWT before mounting the MFE. The MFE never sees the raw magic link — it always works with a JWT.

For anonymous → named conversion (Screen 3): on account creation or login, the backend returns a new JWT. The MFE updates the shared auth context so the shell and all other federated modules pick up the new identity seamlessly. No logout, no page reload.

### The Flow — Router-Driven State Machine

Each screen is a route under the MFE's lazy-loaded assessment module:

```
/assess/:token
  ├── /consent        (Screen 0 — always first)
  ├── /intro          (Screen 1)
  ├── /question/:pos  (Screen 2 — parameterized by position)
  ├── /complete       (completion landing)
  └── /contact        (Screen 3 — anonymous only)
```

Route guards do the heavy lifting:

- **ConsentGuard** (`canActivate` on `/intro`, `/question`, `/complete`, `/contact`): checks if consent has been accepted in the current session. If not, redirects to `/consent`. This is the architectural enforcement of the "consent every session" rule (AC-02, AC-05) — it's not a UI check, it's a navigation gate. Even if someone manually types `/question/50` in the URL bar, the guard catches it.

- **CompletionGuard** (`canActivate` on `/contact`): only allows navigation to contact details if the assessment is actually completed AND the participant is anonymous (AC-16). Named participants hitting this route get redirected to `/complete`.

- **GraceGuard** (`canActivate` on `/question`, `/consent`): checks whether the order is still within its grace window (`order.end_date + 7 days`). If expired, redirects to an expiry landing with the localized message "this assessment has expired — contact your administrator" (AC-15). No further interaction is allowed.

- **AssessmentResolver** (`resolve` on the parent `/assess/:token`): fires once on entry. Fetches the assessment config (metadata, question count, scale config, progress segment definitions, consent cascade URLs) AND the in-progress state if resuming. Stores everything in `AssessmentStateService`. Every child route can inject the service and read hydrated state without re-fetching.

The resolver is the single network call on entry (branding comes from the shell singleton, not this call). The consent screen, intro screen, and first question screen all render from already-loaded data. No loading spinners between screens.

### The Screens

**ConsentComponent (Screen 0)** — AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-23

Receives the cascade config from `AssessmentStateService` — an array of 1, 2, or 3 consent items, each with a tier (`isv | client | assessment`), display name, and URL. The cascade follows the skip-tier rule: 1 checkbox if only ISV; 2 if ISV+Client or ISV+Assessment; 3 if all three. Order is always ISV → Client → Assessment.

Renders them with `*ngFor`. Each checkbox is a native `<input type="checkbox">` (not a div-with-click-handler) tracking its own `checked` state and `accepted_at` timestamp (captured on click, not on form submit). Each label has differentiated text per tier ("Ich bin einverstanden mit den Datenschutzbestimmungen von {tier name}") with the bold portion as a hyperlink (`target="_blank"`, `rel="noopener noreferrer"`) to the configured URL.

The CTA button binds `[disabled]="!allChecked()"` with tooltip "Please accept all privacy statements to continue" (localized, AC-04). When enabled, renders in `primary_action_color`. When clicked, fires all consent records to the backend in a single batch POST — one record per checkbox, each carrying: `accepted_at`, `tier`, `tier_ref`, `url_at_acceptance`, `url_hash_at_acceptance` (SHA-256 computed client-side), `language_at_acceptance`, `participant_ref` (person id for named, **anonymous-token id for anonymous** per AC-07). On success, marks the session as consented in `AssessmentStateService` and navigates to `/intro`.

Per-session re-prompt (AC-05): the `ConsentGuard` enforces this — on every session entry (including resume), consent state starts as `false`. Previous session records remain as historical evidence; new acceptance creates a new set.

URL change detection (AC-08): each acceptance stores the `url_hash_at_acceptance`. If the ISV updates their privacy URL between sessions, the new session's hash will differ from the previous session's, enabling cross-session comparison in compliance queries.

Tab order (AC-23): checkbox 1 → its hyperlink → checkbox 2 → its hyperlink → checkbox 3 → its hyperlink → CTA → Back link (if rendered) → pause icon. Disabled CTA announces "disabled" + reason.

Back link: visible only if entry was from the dashboard; hidden in magic-link first-entry and resume.

**IntroComponent (Screen 1)** — AC-09

The simplest component. Renders the assessment description from the L2 catalog (via `AssessmentStateService`), as authored — no placeholder substitution. The CTA label switches between the configured "Start" label and a localized "Continue" based on whether `AssessmentStateService.resumePosition` exists.

On click, navigates to `/question/1` for fresh starts or `/question/{resumePosition}` for resumes — directly to the paused question, not back to question 1.

Language is fixed at invitation time (Quick Invite) — the participant's `preferred_language` does NOT override (per ADR-016).

**QuestionComponent (Screen 2)** — AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-22

This is where 90% of the UX complexity lives.

The component is parameterized by `:pos` in the route. On route param change (not component re-init — Angular reuses the component instance for param changes by default, which is what we want), it:

1. Loads the question at position `pos` from the pre-fetched question set
2. Loads any existing answer from state (for back-navigation or resume)
3. Resets the timing clock (`performance.now()`)
4. Renders the Likert scale

The Likert scale is its own component (`LikertScaleComponent`) — a `role="radiogroup"` container with N radio circles (configurable 2–10, default 7 per AC-10). It accepts `scaleLength`, `extremeLabelLow`, `extremeLabelHigh`, and `selectedValue` as inputs, emits `(selected)` with the chosen value. Only the first and last circles carry labels (the extremes per question catalog). Keyboard handling (arrow keys to navigate, Space/Enter to select) lives inside this component (AC-22). Accessible names are computed internally: first circle gets `"1 of N, {extremeLabelLow}"`, last gets `"N of N, {extremeLabelHigh}"`, intermediates get position only (`"4 of 7"`). Colour is NOT the sole cue — a checkmark/inner indicator marks the selected circle.

Segmented progress bar: 1 segment per scoring section declared in the catalog. Display-only, not clickable. `role="progressbar"`, `aria-valuenow`/`aria-valuemax`, `aria-label="Section {k} of {n}"`.

On selection, the component calls `AutoSaveService.save(questionId, value, secondsElapsed)`. This returns an Observable. The component subscribes:
- On next (success): enables the forward arrow, updates local state. The UI confirms visually AFTER server-side save — no optimistic UI (AC-11).
- On error: shows the non-blocking "Saving... please don't close yet" notice, `AutoSaveService` handles retry internally (AC-12).

When the participant changes a previous answer (back arrow + click another circle), a new append-only entry is persisted — the previous answer remains in history.

The forward/back arrows:
- Back: `router.navigate(['../', pos - 1])`, disabled at pos === 1. Previous answer is pre-selected and editable.
- Forward: `router.navigate(['../', pos + 1])`, disabled until save confirmed. Tooltip: "Please select an answer to continue".
- At last question: forward becomes a visually-distinct "Submit/Complete" button, triggers `AssessmentFlowService.complete()` (AC-13).
- Skip NOT supported — forward arrow disabled if no answer.

Completion flow (AC-15): when Submit is clicked, `AssessmentFlowService.complete()` fires `POST /api/assessments/:token/complete`. The backend handles the 6-action atomic transaction (persist final answer, close in-progress observation, write completion observation, write `consumption_completed` ledger entry, transition invitation lineage, emit completion event + audit). The frontend's responsibility is:
- Send the completion request with the idempotency key (`Idempotency-Key` header per ADR-018) so retries are safe.
- Handle success → route to `/complete` (named) or `/contact` (anonymous) per AC-16.
- Handle grace-expired rejection (HTTP 410 or equivalent) → display the localized "this assessment has expired — contact your administrator" message (AC-15).
- Handle failure → display error + manual retry option.

Pause (AC-14): click on the pause icon (in the MFE header, not in this component) → `AssessmentFlowService.pause()` persists current state (already saved via auto-save) + writes paused state marker + ends session. The MFE renders the "Pause confirmed — return via your link" localized screen. Resume via the same magic link → Screen 0 → re-acceptance → Screen 1 "Continue" → directly to paused question.

**ContactDetailsComponent (Screen 3)** — AC-16, AC-17, AC-18, AC-19

Renders only for anonymous participants after completion. No pause icon on this screen (completion has already happened).

Reactive form with 4 required fields: Email, Company Name, Name, Phone Number. Email gets `Validators.email`. CTA "Send my results" disabled until all fields valid.

- On submit with **unregistered email** (AC-18): backend creates account with `username = email` + generated OTP + flag `password_must_change_on_first_login`. Returns a new JWT. The MFE updates the shared auth context (shell singleton), dispatches OTP email, session continues with new identity — no logout, no redirect. Routes to dashboard.
- On submit with **registered email** (AC-17): backend returns 409. Component opens a modal with "This email is already registered" + inline login fields. Successful login → new JWT → shared auth context updated → completion linked to existing account → routes to dashboard.
- **Zurück** back link (AC-19): navigates to `/complete` (completion landing). No account is created. Completion observation is preserved. Magic link remains valid (multi-use within TTL) — they can return and see Screen 3 again.

**CompletionLandingComponent**

Brief screen: "Thank you — your responses have been recorded. Your administrator will release your results when ready." (localized) + "Return to Dashboard" button. This is the terminal screen for named participants and the Zurück fallback for anonymous.

### Key Services

**AssessmentStateService**

The brain. Holds:
- Assessment config (metadata, questions, scale config, consent cascade, progress segment definitions)
- Session state (consented: boolean, current position, answers map, resume position)
- Participant context (named vs anonymous, participant ref — person id or anonymous-token id)
- Order grace window (`order.end_date + 7 days`) for client-side grace checks

Populated once by the resolver. Mutated by consent acceptance, answer saves, and completion. This is a plain injectable singleton — no NgRx, no state management library. The flow is linear with no concurrent state mutations. A BehaviorSubject for reactive bits where templates need to subscribe (like the progress bar), simple properties for everything else.

I'm deliberately not reaching for NgRx here. The state shape is small, mutations are sequential, and there's exactly one consumer per piece of state. A state management library would add ceremony without solving a real problem.

**BrandingSingletonConsumer**

Reads branding tokens from the Module Federation shared scope singleton exposed by the participant shell. Provides the resolved tokens (wordmark URL, color tokens, assessment_title_style) to the MFE shell component. One read on init, no polling, no re-fetching. If the singleton isn't available (shell misconfiguration), fails with a clear error rather than silently falling back.

**AutoSaveService**

Wraps HttpClient. Exposes `save(questionId, value, secondsElapsed): Observable<void>`.

Internally:
- Fires the POST with `Idempotency-Key` header (per ADR-018) so retries are safe
- On HTTP error: retries with `retryWhen` using exponential backoff (1s, 2s, 4s), max 3 attempts
- Exposes a `saving$: BehaviorSubject<boolean>` that the MFE shell can subscribe to for the "Saving..." indicator
- On exhausted retries: emits through an `error$` subject that the question component catches → explicit error message with manual retry

Concurrent answer saves: if the participant clicks circle 5, then immediately clicks circle 6 before the first save returns, `switchMap` cancels the in-flight request. The backend's append-only model means both would be recorded if both land, but the forward arrow only enables on the final save's success.

Simple RxJS. No queue, no optimistic updates, no offline buffer. The spec explicitly says no fire-and-forget — we wait for server confirmation. So the pipe is: POST → retry on fail → success or error. Linear.

**ConsentService**

Handles the batch POST of consent records. Each record carries its own `accepted_at` timestamp (captured at checkbox click time, not POST time), `url_hash_at_acceptance` (SHA-256 of the URL string computed client-side), `participant_ref` (person id or anonymous-token id), and all other fields per §4.8. Also sends with `Idempotency-Key` per ADR-018.

**TimingService**

Dead simple. `startTimer()` called on question render, `elapsed(): number` called on answer selection. Uses `performance.now()` for precision. Returns integer seconds. No intervals, no subscriptions. Two methods. No PII in timing data.

**AssessmentFlowService**

Orchestrates completion and pause:
- `complete()`: POST to completion endpoint with idempotency key. Handles success (route based on participant type), grace-expired rejection (display localized expiry message), and failure (display error + retry).
- `pause()`: POST to pause endpoint. Writes `assessment.paused` audit event server-side. Renders pause confirmation screen.

### i18n

Assessment content (questions, descriptions, labels, CTA text, extreme labels) comes from the L2 catalog via the backend, already in the correct language — the language was locked at invitation time (per ADR-016 Class A). No client-side translation needed for assessment content.

Shell chrome strings (button labels, tooltips, error messages, accessibility announcements) need translation across de/en/nl/fr (per ADR-016 Class B). Runtime approach: a small translation map loaded as part of the assessment config, keyed by string ID. The MFE components reference `translationService.get('pause.tooltip')`. This keeps us on a single build artifact regardless of language.

Backend error codes (grace-expired, save failure, dispatch blocked) are Class C per ADR-016 — the backend returns a code, the frontend renders the localized message.

The `<html lang="...">` attribute is set once by the MFE on init, pulled from the assessment config language field.

### Browser Back Trap — AC-20

Angular's `CanDeactivate` guard on every route in the assessment module. When the guard fires, it opens a styled, keyboard-accessible confirmation dialog (not `window.confirm`): "Leave assessment? Your progress is saved and you can return via your link." (localized). Cancel → stays on current screen. Leave → executes browser-back; session ends implicitly (state is already auto-saved).

We also push a dummy history state on MFE init (`history.pushState`) so the browser back button triggers Angular's navigation cycle rather than leaving the SPA entirely. Single push on init, the `CanDeactivate` guard handles the rest.

Limitation acknowledged: cannot intercept tab close or browser close. Auto-save ensures no data loss.

### Accessibility — AC-22, AC-23

Baked into each component, not bolted on at the end:

- **Likert** (AC-22): `role="radiogroup"`, `role="radio"` per circle, `aria-checked`, composite `aria-label` per circle (first: "1 of N, {low label}", last: "N of N, {high label}", middle: position only), arrow key navigation, Space/Enter to select and trigger auto-save. Colour is NOT the sole cue — checkmark/inner indicator on selected.
- **Progress bar**: `role="progressbar"`, `aria-valuenow`/`aria-valuemax`, `aria-label="Section {k} of {n}"`
- **Consent checkboxes** (AC-23): native `<input type="checkbox">`, `aria-checked`, associated `<label>` with differentiated text. Tab order: checkbox 1 → hyperlink → checkbox 2 → hyperlink → ... → CTA → Back link (if rendered) → pause icon.
- **Disabled CTA/forward arrow**: `aria-disabled="true"` + `aria-describedby` pointing to a visually-hidden reason span ("Please accept all privacy statements to continue" or "Please select an answer to continue").
- **Modals** (browser-back dialog, existing-email login): focus trap, `role="dialog"`, `aria-modal="true"`, return focus on close.
- **All interactive elements**: visible focus ring via `:focus-visible`.

Plan to run axe-core in integration tests on every screen variant (consent with 1/2/3 checkboxes, question with scale lengths 2/7/10, disabled/enabled states).

### Tenant Isolation — AC-24

Every API call from the MFE carries the JWT issued by the shell, which encodes the tenant context. All emitted events carry the correct tenant context. The MFE does not construct tenant context — it inherits it from the shell's JWT.

RLS at the data layer (backend responsibility) guarantees observations + consent records are scoped to the tenant swim lane. Frontend integration tests verify that a Lencora completion does not leak to Scheelen-side event sinks.

---

## What I Need From Backend (Dhaval)

This is the API contract conversation I want to have early:

**1. Assessment entry endpoint**
`GET /api/assessments/:token/init`
Returns: assessment config (metadata, consent cascade with URLs per tier, question set or question count, scale config, progress segment definitions, order grace window) + in-progress state if exists (current position, existing answers map, participant context including named/anonymous + participant_ref).

Branding is NOT part of this payload — it comes from the shell singleton. This is the single call the resolver makes for assessment-specific data.

**2. Consent batch POST**
`POST /api/assessments/:token/consent`
Headers: `Idempotency-Key` per ADR-018.
Body: array of consent records (tier, tier_ref, accepted_at, url_at_acceptance, url_hash_at_acceptance, language_at_acceptance, participant_ref).
Returns: 201 on success. Backend writes to `consent_acknowledgments` table + emits `assessment.consent_accepted` audit events.

**3. Answer save**
`POST /api/assessments/:token/answers/:questionId`
Headers: `Idempotency-Key` per ADR-018.
Body: `{ value, seconds_to_answer }`.
Returns: 200 on success. Must be idempotent (retries with same key are no-ops). Backend stores append-only (answer changes create new entries, previous entries remain in history).

**4. Completion**
`POST /api/assessments/:token/complete`
Headers: `Idempotency-Key: {order_id}_{participant_id}_completed` per ADR-018 + AC-15.
Returns:
- 200 + `{ participant_type: 'named' | 'anonymous' }` on success (the 6-action atomic transaction completed).
- 410 (or equivalent) if grace expired — response includes localized error message.
- 500 on failure — entire transaction rolled back, safe to retry.

**5. Contact details submit**
`POST /api/assessments/:token/contact`
Headers: `Idempotency-Key` per ADR-018.
Body: `{ email, name, company_name, phone }`.
Returns: 201 + new JWT for new accounts. 409 + `{ reason: 'email_exists' }` for existing email.

**6. Inline login (existing email case)**
`POST /api/auth/login`
Standard login, returns JWT. Frontend updates the shared auth context.

**7. Pause**
`POST /api/assessments/:token/pause`
Returns: 200. Backend writes paused state marker + `assessment.paused` audit event.

The question set should come in full on init — 174 questions with text and labels is ~50–80KB, fine in one payload. This removes network dependency during the actual taking experience and eliminates per-question loading spinners.

---

## Acceptance Criteria Coverage Map

Every AC from the issue is addressed. Here's where each one lands:

| AC | Summary | Frontend Owner |
|----|---------|---------------|
| AC-01 | Focused MFE, own chrome, no parent shell UI | MFE shell component + Module Federation mount |
| AC-02 | Screen 0 before Screen 1 on every entry | ConsentGuard |
| AC-03 | Cascade 1/2/3 checkboxes per URLs | ConsentComponent |
| AC-04 | CTA disabled until all ticked | ConsentComponent |
| AC-05 | Per-session re-prompt on resume | ConsentGuard resets consent state per session |
| AC-06 | Per-acceptance compliance record | ConsentService batch POST |
| AC-07 | Anonymous uses anonymous-token id | participant_ref from AssessmentStateService |
| AC-08 | URL change detection cross-session | url_hash_at_acceptance per record |
| AC-09 | Intro with dynamic CTA | IntroComponent |
| AC-10 | Likert per scale_length 2–10 | LikertScaleComponent |
| AC-11 | Auto-save before enabling forward | AutoSaveService + QuestionComponent |
| AC-12 | Retry on network failure | AutoSaveService exponential backoff |
| AC-13 | Forward/back/submit/no-skip | QuestionComponent navigation |
| AC-14 | Pause/resume | AssessmentFlowService + magic-link re-entry |
| AC-15 | Completion atomic + grace rejection | AssessmentFlowService + GraceGuard |
| AC-16 | Post-completion routing named vs anonymous | CompletionGuard + routing |
| AC-17 | Registered email → login modal | ContactDetailsComponent |
| AC-18 | Unregistered email → account creation | ContactDetailsComponent |
| AC-19 | Zurück preserves completion | ContactDetailsComponent |
| AC-20 | Browser back trap | CanDeactivate + pushState |
| AC-21 | Quick Invite blocked without ISV URL | Error display from backend rejection (frontend shows localized message) |
| AC-22 | Likert radiogroup + keyboard | LikertScaleComponent |
| AC-23 | Screen 0 keyboard + screen reader | ConsentComponent |
| AC-24 | Tenant isolation | JWT from shell + backend RLS; integration test verification |

---

## Test Naming Convention

All automated tests follow the issue's required naming: `test_AC{N}_{snake_case}`.

| Test | Maps to | Type | Verifies |
|------|---------|------|----------|
| `test_AC01_focused_mode_own_chrome` | AC-01 | Component | MFE renders focused chrome; parent shell chrome hidden |
| `test_AC02_consent_before_intro_all_entries` | AC-02 | Integration | Screen 0 before Screen 1 on dashboard, magic-link first, magic-link resume |
| `test_AC03_cascade_1_2_3_checkboxes` | AC-03 | Integration | Cascade renders correctly for 4 URL config combinations |
| `test_AC04_cta_disabled_until_all_ticked` | AC-04 | Integration | CTA disabled/enabled per checkbox count, tooltip |
| `test_AC05_resume_reprompts_consent` | AC-05 | Integration | Pause + resume → Screen 0 re-prompt; previous records persist + new set |
| `test_AC06_per_acceptance_compliance_record` | AC-06 | Integration | N rows in consent_acknowledgments + N audit events |
| `test_AC07_anonymous_uses_token_id` | AC-07 | Integration | participant_ref = anonymous-token id for anonymous flow |
| `test_AC08_url_change_detection_cross_session` | AC-08 | Integration | Distinct hash between sessions; comparison detects change |
| `test_AC09_intro_dynamic_cta` | AC-09 | Integration | "Start" first-entry vs "Continue" resume with jump to correct position |
| `test_AC10_likert_scale_lengths` | AC-10 | Component | Likert N=2, N=7, N=10 with extreme labels on first+last only |
| `test_AC11_autosave_before_forward` | AC-11 | Integration | Server-side save + UI confirm after; answer change = append-only |
| `test_AC12_autosave_retry_on_failure` | AC-12 | Integration | Network failure → notice + 3 retries exponential backoff |
| `test_AC13_navigation_forward_back_submit` | AC-13 | Component | Forward/back/submit/disable when no answer |
| `test_AC14_pause_resume_flow` | AC-14 | Integration | Pause → audit + resume restores position with answers |
| `test_AC15_completion_atomic_and_grace` | AC-15 | Integration | Happy path: 6 actions atomic. Grace expired: rejection + message |
| `test_AC16_post_completion_routing` | AC-16 | Integration | Named → landing. Anonymous → Screen 3 |
| `test_AC17_registered_email_login_modal` | AC-17 | Integration | 409 → modal → login → links completion |
| `test_AC18_new_email_account_creation` | AC-18 | Integration | Account creation + OTP + session continues |
| `test_AC19_zurueck_preserves_completion` | AC-19 | Integration | No account created; completion preserved; magic link valid |
| `test_AC20_browser_back_trap` | AC-20 | Integration | Confirmation dialog on each screen; Leave executes back |
| `test_AC21_dispatch_blocked_no_privacy_url` | AC-21 | Integration | Error message displayed on dispatch rejection |
| `test_AC22_likert_radiogroup_keyboard` | AC-22 | a11y | axe + keyboard + screen reader on Likert |
| `test_AC23_consent_screen_a11y` | AC-23 | a11y | Tab order, aria-checked, disabled CTA announcement |
| `test_AC24_tenant_isolation` | AC-24 | Security | Cross-tenant: Lencora events don't leak to Scheelen |

---

## Risks and Open Questions

1. **Question payload size**: 174 questions upfront vs. paginated. Leaning full load (~50–80KB). If future assessments have 500+ questions, we'd need pagination — but F1 doesn't require it.

2. **Session token lifecycle for anonymous flow**: the magic link resolves to a JWT via the shell. On account creation (Screen 3) we swap to a new JWT in the shared auth context. Need to coordinate the token transition with backend so there's no gap where requests fail.

3. **Concurrent answer saves**: if the participant clicks circle 5, then immediately clicks circle 6 before the first save returns — `switchMap` cancels the first. Backend's append-only model means both would be recorded if both land, but the forward arrow only enables on the final save's success.

4. **Browser back trap limitations**: `CanDeactivate` + `pushState` works for the back button but cannot intercept tab close or browser close. The spec acknowledges this. Auto-save ensures no loss.

5. **Assessment title style token**: `assessment_title_style` is a new per-ISV token. Need to confirm the exact schema from Tenant Service, and ensure any custom fonts are either system fonts or pre-loaded.

6. **Figma design availability**: pixel-perfect UI requires finalized Figma designs for all 4 screens and their state variants. Any design iteration after development starts means rework.

7. **Module Federation version alignment**: the MFE and the participant shell must agree on Module Federation version and shared scope configuration. Need to confirm the shell's existing setup before wiring the remote entry.

8. **Grace window check — client-side vs server-side**: the `GraceGuard` does a client-side check for fast UX, but the completion endpoint is the authoritative gate. Clock skew between client and server could allow a participant to enter the flow but get rejected on submit. The server is always the source of truth.

---

## Developer Estimate

**Complexity:** XL

**Estimated effort:** 72–100 hours (9–13 working days)

### Phase Breakdown

| Phase | What | Hours | Days |
|-------|------|-------|------|
| **Phase 1 — Scaffolding & Module Federation Setup** | Create `velocity-frontend-assessment` MFE project, configure Module Federation remote entry (`exposes`), wire into participant shell as federated remote, verify mount in focused mode (shell chrome hidden), set up router skeleton with all routes + empty screen components + guards stubbed, consume branding singleton + JWT from shared scope, verify CSS custom properties flow end to end with mock branding. Whole flow navigable with placeholder screens. | 6–8 | 1 |
| **Phase 2 — UI Development (Figma to Code)** | Pixel-perfect implementation of all four screens from Figma designs, MFE focused chrome (header with wordmark + title + pause, footer), responsive card layouts, segmented progress bar, LikertScaleComponent, consent checkbox cascade, contact details form, completion landing, pause confirmation screen, browser-back confirmation dialog, existing-email login modal, all hover/focus/active/disabled states, branding tokens applied via CSS custom properties | 28–36 | 3.5–4.5 |
| **Phase 3 — Business Logic & Services** | ConsentGuard + CompletionGuard + GraceGuard, AssessmentResolver, AssessmentStateService (session state), AutoSaveService with exponential backoff retry, ConsentService with per-checkbox timestamps and URL hashing, TimingService, AssessmentFlowService (completion with idempotency key + grace rejection handling, pause), anonymous contact details flow (account creation + JWT swap in shared auth context, existing email login modal + JWT swap, Zurück), browser-back trap (CanDeactivate + pushState), BrandingSingletonConsumer | 20–28 | 2.5–3.5 |
| **Phase 4 — i18n & Accessibility** | Runtime translation service for MFE chrome strings (de, en, nl, fr), `<html lang>` attribute, WCAG 2.1 AA across all screens, LikertScaleComponent radiogroup keyboard navigation + screen reader semantics, disabled-state reason announcements, consent screen tab order + aria, focus management on modals, progress bar announcements, axe-core integration in tests | 8–12 | 1–1.5 |
| **Phase 5 — Testing** | `test_AC{N}_{snake_case}` for all 24 ACs, integration tests (full named flow, full anonymous flow, pause/resume, grace rejection, Quick Invite gate error display), consent cascade variants (1/2/3), Likert at scale lengths 2/5/7/10, auto-save retry + failure, tenant isolation verification, axe-core on all screen variants | 10–16 | 1.5–2 |

### Assumptions

1. **Backend APIs are available for integration by Phase 3.** Phases 1–2 can proceed with mocked responses. Phase 3 onward needs real endpoints.

2. **Figma designs are finalized.** Pixel-perfect UI work requires stable designs for all 4 screens + state variants.

3. **Participant shell's Module Federation setup exists.** The shell already exposes shared scope for JWT and branding singleton. If it doesn't, wiring time increases.

4. **Single assessment type.** Likert-only, linear, no-branching. New question types or skip logic is a separate estimate.

5. **Accessibility implementation is included; manual screen reader pass (NVDA + VoiceOver) is separate** if expected to be performed by me rather than QA.

6. **Code review cycles.** The estimate includes writing the code and self-review. It does NOT include time spent in PR review cycles with the team. Depending on review turnaround and how many revision rounds are needed, this could add 1–3 days on top.

### Questions for Owner

1. Are the Figma designs for this flow finalized and ready?
2. Does the participant shell already have Module Federation configured with shared scope for JWT and branding? Or does that need to be set up as part of this work?
3. Who provides the translation strings for the 4 languages (de, en, nl, fr) — translator, assessment catalog, or do I write them?
4. For the manual screen reader pass (NVDA + VoiceOver) — QA or me?
5. Is there an existing modal/dialog pattern in the codebase I should follow for the browser-back dialog and login modal?

---

## Timeline Against May 31 Deadline

**Proposal submitted:** May 14
**Coding start:** May 15
**Deadline:** May 31
**Available working days (May 15–31):** ~12 weekdays

The 10–13 day estimate fits within the window.

**May 15 (Day 1) — Phase 1: Scaffolding & Module Federation**
- Create MFE project, configure Module Federation remote entry
- Wire into participant shell, verify focused mode mount
- Router skeleton with all routes, empty components, guards stubbed
- Branding singleton consumed, CSS custom properties verified
- End of day: navigable flow with placeholder screens

**May 16–23 (Days 2–9) — Phase 2 + Phase 3: UI + Logic**
- Pixel-perfect Figma implementation of MFE chrome + all 4 screens
- Question screen + LikertScaleComponent (priority — 95% of participant time)
- AutoSaveService with retry wired to real endpoints
- Consent screen with cascade + compliance record POSTs
- Intro screen with resume-aware CTA
- Completion flow with idempotency + grace rejection
- Contact details: account creation, login modal, Zurück
- Pause/resume flow
- Browser back trap

**May 26–28 (Days 10–12) — Phase 4 + Phase 5: Polish + Tests**
- i18n shell strings (de, en, nl, fr)
- Accessibility pass: axe-core, keyboard walkthrough, ARIA
- All `test_AC{N}` tests
- Integration tests: named flow, anonymous flow, pause/resume, grace rejection
- Tenant isolation verification
- Cross-browser testing

**May 29–30 (Days 13+) — Buffer**
- Code review revisions, edge cases, final fixes, any remaining test coverage

**Critical path risks:**
- **Late API readiness** — if endpoints aren't testable by May 19, Phase 3 stalls
- **Figma changes mid-development** — rework on pixel-perfect UI burns days
- **Module Federation shell integration issues** — if the shell's shared scope isn't ready, Day 1 scaffolding extends

---

## Build Order

Sequence once repo access is granted:

**Day 1 — Foundation**
1. MFE project creation + Module Federation remote entry configuration
2. Wire into participant shell, verify focused mode (shell chrome hidden)
3. Router skeleton — all routes, empty screens, guards stubbed
4. Branding singleton consumption — CSS custom properties verified with two brand configs (Lencora + Scheelen)

**Days 2–9 — Core Experience (UI + Logic)**
5. Question screen + LikertScaleComponent from Figma — the core experience. Accessibility pass here.
6. AutoSaveService — HTTP calls, retry logic, saving indicator, idempotency key.
7. Consent screen from Figma — cascade rendering, per-checkbox timestamps, batch POST, URL hashing.
8. Intro screen — resume-aware CTA.
9. Completion flow — idempotency, grace rejection, post-completion routing.
10. Contact details from Figma — account creation, login modal, JWT swap in shared auth context, Zurück.
11. Browser back trap — CanDeactivate + pushState.
12. Pause/resume — pause endpoint, confirmation screen, magic-link re-entry.

**Days 10–12 — i18n, Accessibility, Tests**
13. i18n — translation map for MFE chrome strings, `<html lang>`.
14. Full test suite — `test_AC{N}_{snake_case}` for all 24 ACs + integration flows.
15. axe-core on all screen variants, keyboard walkthrough.

**Day 13+ — Buffer for code review cycles, edge cases, and fixes.**

The question screen is early (step 5) because it's where participants spend 95% of their time and where all the hard UX problems live. Everything else is a form or a static page.

---

## What's Deliberately Not Here

- **No NgRx / state management library.** The state is too simple and linear. One service with a BehaviorSubject covers it.
- **No component library (Material, PrimeNG, etc.).** The UI components are bespoke to this flow. Pulling in a library for 5 components adds weight without value, and makes pixel-perfect Figma matching harder.
- **No SSR.** This is an authenticated, stateful, interactive flow. Server-side rendering adds complexity with no benefit.
- **No offline/PWA capabilities.** Auto-save handles the reliability concern. Full offline is out of scope and not worth the service worker complexity for F1.
- **No separate Angular bootstrap.** The MFE is a federated remote — it shares the shell's Angular platform instance via Module Federation. No duplicate framework bundle.
