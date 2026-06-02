---
name: jaskill
description: Use BEFORE marking any PR ready for review. Forces a regression-aware self-review pass so changes outside the ticket's happy path (state updates, optional fields, shared flows, existing workflows that touch the same screens) get tested instead of breaking in review. Outputs a PR-body test plan note.
---

# jaskill — pre-PR self-review

The point of this skill is to close one specific gap: a working happy path that quietly breaks adjacent flows. That's the single most common reason a PR gets pushed back. This skill makes you do the regression sweep before the reviewer does.

**Run this skill when:**

- You're about to mark a PR "ready for review" (or push for the first time)
- You modified anything in a shared UI component, shared hook, store slice, or query
- The ticket touches a flow more than 2 steps long
- You changed a route, layout, or anything inside `components/ui/`

**Do NOT skip steps. Reviewer pushback for "tested only the happy path" is exactly what this skill exists to prevent.**

## Step 1 — Re-read the ticket against the diff

```bash
git diff $(git merge-base HEAD origin/master)..HEAD --stat
```

Open the ticket side-by-side with the file list. For each file, ask:

- Is this file actually required for the AC, or did I drift?
- For any file outside the obvious area (shared components, ui/, hooks/, store/, queries/) — write the answer to "why does this need to change?" in one sentence. If you can't, the change probably doesn't belong.

If the answer to anything feels ambiguous, post in the team channel **now**, before review. The cost of asking is a few minutes. The cost of guessing is a re-review round.

## Step 2 — Find every caller of anything shared you touched

```bash
# For each shared file you modified:
git diff --name-only $(git merge-base HEAD origin/master)..HEAD | grep -E "components/ui|components/shared|hooks|store|queries"
# For each one, grep for usages:
grep -rln "ComponentNameYouChanged" frontend/src
```

Walk through each call site mentally:

- Does the existing use case still work?
- Does the new prop/behavior break an old caller that didn't pass it?
- Is there a removed prop that some caller still passes?

If you changed a shared component and didn't visit at least 3 call sites in the running app — you're not done.

## Step 3 — Test the unhappy paths the ticket didn't list

The reviewer will. Pre-empt them:

- **Empty state** — what does the page look like when the API returns `[]` or `count: 0`?
- **Optional fields blank** — submit the form with optional fields left empty.
- **Going back and changing** — make a selection, advance, hit Back, change the selection, advance again. State should reset cleanly.
- **Error state** — disconnect the network or hit a 500. Does it show a useful message or just spin forever?
- **Permission edges** — if a feature is role-gated, log in as the other role and verify it's correctly hidden / redirected.

For each of these you tested, write a one-line note. You'll paste this into the PR body.

## Step 4 — Run the actual checks, not just typecheck

Typecheck passing is the floor, not the ceiling. Run, in this order:

```bash
# Type + lint
pnpm tsc --noEmit
pnpm biome check

# A11y audit (full default — multi-persona)
cd frontend && pnpm a11y

# E2E relevant to the area you touched
# (pick the suite, don't run everything — but don't run nothing either)
pnpm e2e --grep "<area-or-flow-name>"
```

If a11y reports any new violations, fix them. They're easier to fix while the code is fresh than after review.

## Step 5 — Code-review skill pass

If a `/code-review` skill is configured for this repo, run it before opening the PR. It catches things you've gone blind to after staring at the diff for a day.

```
/code-review
```

Address everything tagged HIGH. Decide consciously on MEDIUM. LOW is optional.

## Step 6 — Write the PR body test plan

Paste this into the PR description, filled in. Don't open the PR without it.

```markdown
## Test plan

**Manual checks performed:**
- [x] Happy path: <one line>
- [x] Empty state: <one line>
- [x] Edit-then-change: <one line>
- [x] Permission edge (other persona): <one line>
- [x] Error state: <one line>

**Automated:**
- [x] `pnpm tsc --noEmit` clean
- [x] `pnpm biome check` clean
- [x] `pnpm a11y` — N violations, M scan errors (link or paste relevant lines)
- [x] `pnpm e2e --grep <area>` — N passed
- [x] `/code-review` run, no HIGH findings outstanding

**Shared components touched + call sites verified:**
- `<ComponentName>` — verified in `<route1>`, `<route2>`, `<route3>`
```

If a section is `N/A` for this PR, write `N/A — <reason>` instead of deleting the row. The reviewer should see you considered it.

## Step 7 — Now you can mark ready for review

Not before.

## Anti-patterns this skill exists to block

- "I tested it locally and it works" — meaningless without saying *what* you tested.
- "TypeScript passes" — TypeScript catches ~5% of real bugs. Don't lean on it.
- "The happy path works, the rest is out of scope" — anything you touched is in scope for regression checking, even if not in scope for new behavior.
- Opening a PR right after the last commit lands — give yourself 15 minutes to step away, then run this skill with fresh eyes.

## When this skill saves you

The cases it catches are exactly the ones cited as the main feedback area:

- Changing shared UI without checking other consumers
- Dropping existing behavior because the new ticket didn't mention it
- State updates that work going forward but corrupt on going back
- Optional fields that worked when filled, broke when empty
- A flow that worked for one persona but redirected for another

Every one of those is something a reviewer notices instantly and that this skill catches in under 30 minutes of disciplined self-review.
