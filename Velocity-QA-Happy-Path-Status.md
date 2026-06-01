# Velocity — QA Happy Path Status

Status snapshot for the QA engineer joining the Velocity team. Where the
happy path stands on dev, what's blocked, who is unblocking what, and how
to start testing today.

_Last updated: 2026-06-01_

---

Hey  — welcome to the QA side. Happy to get you up to speed on where the happy path stands.

## The platform in one paragraph

Velocity is a multi-tenant psychometric SaaS — an admin-facing portal where operator teams invite participants and run assessments, and a participant-facing take-flow where invited users complete those assessments. The frontend is a Module Federation setup: a thin shell (`velocity-frontend-identity`, the host) loads remote MFEs (`velocity-frontend-auth` for IAM, `velocity-frontend-assessment` for taking flow) based on the route. Each MFE talks to its own backend service (Identity API for auth, Assessment API for taking flow) over REST + GraphQL. JWT is held by the shell and shared across all remotes via a single `TokenService` instance.

## Happy path — end-to-end

The flow we're stabilizing for UAT, in order:

1. Login at `https://app-apxd-dev-frontend.azurewebsites.net` (shell origin, dev)
2. Tenant selection if the user belongs to multiple ISV memberships
3. Shell renders with default chrome (header, nav, footer, branding from `BrandingService`)
4. **My Tasks** at `/assessment/tasks` — capability-gated list of assessments assigned to the user (HU-49)
5. **Take an assessment** — full take-flow, intro → consent → questions → submit → confirmation, rendered in bare layout (no shell chrome) (HU-52)
6. Admin flows — Quick Invite (HU-36), results, role management — separate path through admin chrome
7. Logout — clean session teardown across the shell and every remote

## What's verified (shipped + deployed to dev)

| Layer | Status |
|---|---|
| Login → tenant select → `/me/context` returns 200 | Working (3 MF singleton fixes merged 2026-05-29) |
| `TokenService` resolves as a single instance across shell + 3 MFEs | Working (PRs auth #21, shell #35, assessment #13) |
| Chrome-primitives library v0.1.0 shipped (shared `TokenService` + bearer interceptor + branding + label + capability primitives) | Published to the `pkg` branch |
| Shell mounts auth remote under `/iam/*` | Working |
| Bare layout mechanism (`route.data.layout === 'bare'`) for participant take-flow | Working |

## What's in flight (blocking the full happy path right now)

| Item | Owner | What it blocks | Status |
|---|---|---|---|
| [assessment #16](https://github.com/apexdynamics/velocity-frontend-assessment/pull/16) — `publicPath` pin so cross-origin lazy chunks resolve to the assessment origin, not the shell origin | Me | Mounting the assessment MFE from the shell. Without this, every assessment chunk 404s against the shell domain. | OPEN, awaiting any reviewer |
| [chrome-primitives #3](https://github.com/apexdynamics/velocity-frontend-chrome-primitives/pull/3) — HU-84 v0.2.0 closeout (README, MIGRATION, ships `tokens.css`) | Me | HU-84 closure | OPEN, awaiting Carlos |
| [apexdynamics-docs #32](https://github.com/apexdynamics/apexdynamics-docs/pull/32) — **MVP happy-path test plan + per-MFE smoke + live endpoint inventory** | Me | Your test plan reference doc | OPEN since 2026-05-26, awaiting Carlos |
| [identity #34](https://github.com/apexdynamics/velocity-frontend-identity/pull/34) — bearer-bridge defensive fallback | Me / Carlos call | Possibly redundant after the singleton fix landed | OPEN, awaiting architectural decision |

## What Carlos is doing to unblock

Reviewing the three open PRs above. Once `docs #32` lands, that PR's `MVP-HAPPY-PATH-TEST-PLAN.md` becomes your canonical reference — 14 end-to-end flows aligned 1:1 with Patrick's Figma slides plus per-MFE smoke scenarios. Once `assessment #16` lands, the assessment MFE actually mounts in the shell and HU-49 + HU-52 become testable end-to-end on dev.

## What this means for your testing today

- **Login + shell render** — fully testable on dev. Hit the shell URL, sign in, verify tenant select if your account has multiple memberships, verify the shell chrome (header, nav, branding) loads.
- **`/assessment/tasks`** — the route resolves, but the MFE itself currently 404s its lazy chunks because of the `publicPath` bug (`assessment #16`). To verify HU-49 standalone today, run the assessment remote alone on `:4202` (no shell) — that path works because chunks resolve against the same origin.
- **Take-assessment flow (HU-52)** — same as above. 100% BE, ~90% FE; full end-to-end testable in the shell once `#16` merges.
- **Test plan reference** — read `#32`'s PR diff for the test plan content even though it isn't merged yet; it's the source of truth for which flows to run and what each one expects.

## Suggested first steps

1. Get dev access — `https://app-apxd-dev-frontend.azurewebsites.net`. If you don't have a test account, ask Patrick to provision one with admin role on a dev ISV.
2. Walk through what works today: login → tenant select → shell render. Confirm chrome loads, branding paints, nav is populated.
3. Read [`#32`'s `MVP-HAPPY-PATH-TEST-PLAN.md`](https://github.com/apexdynamics/apexdynamics-docs/pull/32/files) for the 14 flows you'll eventually run.
4. Pick a test framework — we've been writing unit tests in Vitest (assessment FE), and there's no E2E framework standardized yet. If you have a preference (Playwright vs Cypress), now is a good moment to set the convention.
5. Once `#16` and `#32` land, ping me — we can do a full happy-path walkthrough together against dev.

---

That's the state of play. Let me know what blocks you on getting started and I'll unstick it.
