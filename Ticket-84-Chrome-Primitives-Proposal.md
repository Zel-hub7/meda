# Ticket #84 — Frontend Technical Proposal: Chrome Primitives Shared Library

---

## How I See This

After reading the spec and tracing the dependencies, the core problem is clear: every federated frontend on the platform needs the same five things — the right logo, the right labels, the right menu items, the right theme, and a footer. Today each frontend either builds these locally or doesn't have them yet. That means N frontends times M ISVs worth of duplicated resolution logic, and the first ISV onboarding after Lencora will expose every inconsistency.

The solution is a shared Angular library — an npm package, not an app — that every federated frontend imports. The library owns the resolution logic (branding inheritance, label fallback, capability gating) and exposes small, composable visual primitives that consume that logic. Each frontend still composes its own chrome layout; the library provides the atoms.

The temptation is to build full chrome shells (an "admin layout component," a "participant layout component"). The spec explicitly says not to. The library is primitives, not compositions. If two frontends end up composing the same layout from the same primitives, that extraction is a future story driven by observed duplication. I agree with this boundary — it keeps the library small and its API surface tight.

---

## Architecture Overview

### Library, Not App

This is an Angular library published as an npm package. It ships no routes, no pages, no bootstrap. It exports:

1. **Services** — `BrandingService`, `LabelService`, `CapabilityService` — the resolution engines
2. **Primitives** — standalone Angular components and directives that consume those services
3. **Design tokens** — CSS custom properties applied at the page level
4. **A single init function** — the consuming frontend calls `initChromePrimitives({ user, tenant, locale, capabilities })` once, and everything lights up

```
Consuming Frontend (e.g., velocity-frontend-assessment)
│
├── imports @apexdynamics/chrome-primitives
├── calls initChromePrimitives(sessionContext) once on bootstrap
│
└── composes its own chrome:
    ├── <adx-wordmark />              ← from library
    ├── <h1>{{ pageLabel('dashboard') }}</h1>  ← pipe from library
    ├── <adx-user-menu />             ← from library
    ├── <router-outlet />             ← frontend's own screens
    └── <adx-footer />                ← from library
```

The library is a **Module Federation singleton** (`shareScope: 'default'`, `singleton: true`). Every MFE in the same shell shares one instance, one cache, one resolved branding state. No redundant API calls, no inconsistent cache windows.

### Why a Singleton Matters

Two MFEs loaded in the same shell both need the LENCORA logo. Without singleton sharing, each fetches branding independently — two API calls, two caches, two potential inconsistencies. With the singleton, the library resolves branding once, both MFEs read from the same reactive state.

---

## The Three Resolution Engines

These are the core of the library. The primitives are thin rendering layers on top of them.

### 1. BrandingService — Hierarchy Inheritance

The platform's tenant model is a tree: ISV → Reseller → Client → (sub-levels possible). Branding attributes (logo, display name, theme tokens) cascade downward. If a tenant doesn't define a logo, it inherits from its parent. If the parent doesn't have one either, walk up until you find one or hit the platform default.

```
BrandingService.resolve(tenantId):
  1. Fetch tenant's own branding from Tenant Service
  2. For each attribute (logo, displayName, themeTokens):
     - if present → use it
     - if absent → fetch parent's branding, check again
     - repeat until ISV root
     - if still absent → platform default (text wordmark, base theme)
  3. Cache the resolved result per ADR-019 TTL
  4. Expose as readonly signals: logo(), displayName(), themeTokens()
```

The walk is performed once per session. Results are cached reactively — every primitive that reads `brandingService.logo()` re-renders if it changes (e.g., admin updates branding in another tab and the cache expires).

**Theme token application:** Once resolved, theme tokens are written as CSS custom properties on `document.documentElement`:

```css
:root {
  --adx-primary: #0EB0C3;      /* from ISV config */
  --adx-secondary: #64748b;
  --adx-font-family: 'Roboto';
  --adx-radius-card: 24px;
  --adx-radius-button: 16px;
  /* ... full token set */
}
```

Every component in every MFE — library primitives and frontend-local components alike — inherits these automatically. No per-component wiring. This is exactly what we did manually in HU-52 with `@HostBinding`, but centralized.

### 2. LabelService — Per-ISV Per-Language Resolution

Every page name, role name, and UI label in the platform is catalog-driven (HU-42). The label for "My Tasks" in Lencora-German is different from Scheelen-German. The library resolves these at render time:

```
LabelService.resolve(key, category):
  1. Look up (activeISV, activeLanguage, key) in cached catalog
  2. If found → return it
  3. If missing → try (activeISV, isvDefaultLanguage, key)
  4. If still missing → try (activeISV, 'en', key)
  5. If still missing → return key itself as last resort
  6. On every fallback: emit audit signal { key, category, isv, requestedLang, resolvedLang }
```

Exposed as:
- `LabelService.get(key): Signal<string>` — reactive, re-renders on language change
- `adxLabel` pipe — `{{ 'my-tasks' | adxLabel }}` in templates
- `adxRoleLabel` pipe — same, for role display names

Language changes within a session (user switches from German to English) trigger a cache lookup and re-render — no page reload needed (AC-03).

### 3. CapabilityService — Pre-Mount Gating

Every UI element that should be visible only to certain roles is wrapped by the capability gate:

```html
<div *adxIfCapability="'manage_team'">
  <button mat-button>Manage Team</button>
</div>
```

If the user doesn't hold `manage_team`, the `<div>` is **never added to the DOM** — not rendered then hidden, not shown with `display: none`, never briefly visible. The structural directive checks the capability map before Angular creates the view (AC-04, flicker-free).

```
CapabilityService.has(capability):
  1. Read user's role from session context
  2. Look up role → capabilities mapping from HU-42 catalog (cached per ADR-019)
  3. Return boolean
```

---

## Visual Primitives

Each primitive uses **Angular Material** as its component foundation (per the Frontend Implementation Guide). The library themes Material to match the resolved branding tokens.

### WordmarkComponent (`<adx-wordmark>`)

```
Inputs:  size ('sm' | 'md' | 'lg'), fallbackText (string)
Renders: <img> if logo URL resolved, <span> with platform name if not
A11y:    alt text = resolved displayName, never "image" or empty
```

Consumes `BrandingService.logo()` and `BrandingService.displayName()`. The inheritance walk is invisible to the consumer — they drop `<adx-wordmark />` and the right logo appears.

### FooterComponent (`<adx-footer>`)

```
Renders: "© {year} apexdynamics.io LLC"
```

One line, but it needs to be identical on every surface. One component, done.

### AvatarComponent (`<adx-avatar>`)

```
Inputs:  user (UserContext — name, imageUrl)
Renders: <img> if imageUrl present, initials circle if not
A11y:    aria-label = user's display name
```

Initials computed from first + last name. Background color derived from name hash for visual variety.

### UserMenuComponent (`<adx-user-menu>`)

```
Inputs:  menuItems (MenuItemConfig[])
Renders: <adx-avatar> trigger + mat-menu dropdown
```

Each `MenuItemConfig` has a `capability?: string` field. Items with a capability are wrapped by `CapabilityService.has()` internally — if the user doesn't have it, the item doesn't render. No flicker, no `[hidden]`.

Built on `mat-menu` from Angular Material — keyboard navigation, focus management, and a11y come for free.

### Header Building Blocks

Not a single `<adx-header>` component — that would be a composite chrome, which is out of scope. Instead, individual slots:

- `<adx-header-logo-slot>` — positions the wordmark
- `<adx-header-breadcrumb-slot>` — positions breadcrumb content (projected via `ng-content`)
- `<adx-header-actions-slot>` — positions action elements (user menu, notifications, etc.)

Each frontend arranges these in its own header layout:

```html
<!-- Admin chrome -->
<header class="admin-header">
  <adx-header-logo-slot />
  <adx-header-breadcrumb-slot>
    <nav>Dashboard / Teams</nav>
  </adx-header-breadcrumb-slot>
  <adx-header-actions-slot>
    <adx-user-menu [menuItems]="adminMenuItems" />
  </adx-header-actions-slot>
</header>

<!-- Assessment chrome (our HU-52) -->
<header class="assessment-header">
  <adx-header-logo-slot />
  <h1 class="title">HEALTH CHECK</h1>
  <button class="pause-btn">⏸</button>
</header>
```

Same wordmark, different layouts. The library provides the atoms, the frontend provides the molecule.

### Design Tokens

A base token set shipped as CSS:

```css
/* @apexdynamics/chrome-primitives/tokens.css */
:root {
  /* Spacing */
  --adx-space-xs: 4px;
  --adx-space-sm: 8px;
  --adx-space-md: 16px;
  --adx-space-lg: 24px;
  --adx-space-xl: 32px;
  --adx-space-2xl: 48px;

  /* Typography */
  --adx-font-sans: 'Roboto', system-ui, sans-serif;
  --adx-font-size-sm: 0.875rem;
  --adx-font-size-base: 1rem;
  --adx-font-size-lg: 1.25rem;
  --adx-font-size-xl: 1.5rem;

  /* Base palette (overridden by tenant theme) */
  --adx-primary: #0EB0C3;
  --adx-secondary: #64748b;
  --adx-surface: #ffffff;
  --adx-background: #f8fafc;
  --adx-text-primary: #0f172a;
  --adx-text-secondary: #64748b;
  --adx-border: #e2e8f0;

  /* Focus */
  --adx-focus-ring: 2px solid var(--adx-primary);
  --adx-focus-offset: 2px;

  /* Radii */
  --adx-radius-sm: 8px;
  --adx-radius-md: 16px;
  --adx-radius-lg: 24px;
}
```

When `BrandingService` resolves tenant theme tokens, it overwrites the relevant variables on `:root`. Every component — library and frontend — automatically picks up the tenant's theme. No per-component binding.

---

## What I Need From Backend

### 1. Tenant branding endpoint

`GET /api/tenants/:tenantId/branding`

Returns: `{ logo?: string, displayName: string, themeTokens?: Record<string, string>, parentTenantId?: string }`

The `parentTenantId` is how the library walks the hierarchy. If absent, the tenant is the ISV root.

### 2. HU-42 label catalog endpoint

`GET /api/catalog/labels?isv={isvId}&lang={lang}`

Returns: `{ labels: Record<string, string> }` — all labels for the ISV in the requested language.

Cached client-side per ADR-019 TTL. One call per (ISV, language) pair per cache window.

### 3. HU-42 capability catalog endpoint

`GET /api/catalog/capabilities?role={roleId}&isv={isvId}`

Returns: `{ capabilities: string[] }` — the capabilities granted to this role in this ISV.

Cached client-side per ADR-019 TTL.

---

## Acceptance Criteria Coverage

| AC | Summary | Implementation |
|----|---------|---------------|
| AC-01 | Brand consistency across surfaces | `BrandingService` singleton via Module Federation — every MFE reads the same resolved state |
| AC-02 | Hierarchy inheritance | `BrandingService.resolve()` walks tenant ancestry, one implementation, every primitive consumes it |
| AC-03 | Per-ISV per-language labels | `LabelService` with fallback chain + reactive signals, re-renders on language change without reload |
| AC-04 | Capability gating, flicker-free | `*adxIfCapability` structural directive, checks before mount, content absent from DOM if denied |
| AC-05 | Graceful fallbacks + audit | Platform-default wordmark, label fallback chain with audit signal emission at each level |
| AC-06 | New frontend onboarding | Import library + call `initChromePrimitives()` + compose chrome from primitives = done |
| AC-07 | Multi-ISV isolation | `BrandingService` keys cache by tenant ID, no shared state between ISV sessions |
| AC-08 | Accessibility floor | Angular Material base, axe-core on every primitive, keyboard nav on user menu, logo alt text = ISV name |

---

## Test Naming Convention

Per project convention, all tests follow `test_AC{N}_{snake_case}`:

| Test | AC | Type |
|------|-----|------|
| `test_AC01_branding_identical_across_consumers` | AC-01 | Integration |
| `test_AC02_inheritance_walks_to_reseller` | AC-02 | Unit |
| `test_AC02_inheritance_skips_reseller_to_isv` | AC-02 | Unit |
| `test_AC02_inheritance_falls_to_platform_default` | AC-02 | Unit |
| `test_AC03_label_resolves_for_isv_and_language` | AC-03 | Unit |
| `test_AC03_label_rerenders_on_language_change` | AC-03 | Integration |
| `test_AC03_label_fallback_to_default_language` | AC-03 | Unit |
| `test_AC03_label_fallback_to_english` | AC-03 | Unit |
| `test_AC04_capability_gate_hides_from_dom` | AC-04 | Component |
| `test_AC04_capability_gate_no_flicker` | AC-04 | Component |
| `test_AC04_capability_gate_change_between_renders` | AC-04 | Component |
| `test_AC05_wordmark_fallback_to_text` | AC-05 | Component |
| `test_AC05_label_fallback_emits_audit_signal` | AC-05 | Unit |
| `test_AC06_new_frontend_init_and_consume` | AC-06 | Integration |
| `test_AC07_multi_isv_cache_isolation` | AC-07 | Unit |
| `test_AC08_axe_core_zero_violations_per_primitive` | AC-08 | a11y |
| `test_AC08_user_menu_keyboard_navigation` | AC-08 | a11y |

---

## Developer Estimate

**Complexity:** L

**Hours:** 56–80

### Phase Breakdown

| Phase | What | Hours | Days |
|-------|------|-------|------|
| **Phase 1 — Library Scaffolding & Build** | New repo, Angular library project, npm packaging with semantic versioning, CHANGELOG, CI publish pipeline, Module Federation singleton config, `initChromePrimitives()` entry point, session context interface | 8–12 | 1–1.5 |
| **Phase 2 — BrandingService + Theme Tokens** | Hierarchy inheritance walk, reactive signals, `:root` CSS custom property injection, cache per ADR-019, platform-default fallback, full inheritance test matrix (4 levels) | 12–16 | 1.5–2 |
| **Phase 3 — LabelService + Pipes** | Per-ISV per-language resolution, 3-level fallback chain, audit signal emission, cache, `adxLabel` and `adxRoleLabel` pipes, language-change re-render without reload | 8–12 | 1–1.5 |
| **Phase 4 — CapabilityService + Directive** | Session-based capability resolution, `*adxIfCapability` structural directive, pre-mount check (no flicker), cache per ADR-019, granted/denied/change test matrix | 6–8 | 0.75–1 |
| **Phase 5 — Visual Primitives** | WordmarkComponent, FooterComponent, AvatarComponent, UserMenuComponent (on mat-menu), header building blocks (logo/breadcrumb/actions slots), design token CSS file, axe-core on each | 14–18 | 1.75–2.25 |
| **Phase 6 — Docs, Migration, Visual Regression** | README + consumption guide, per-primitive examples, migration guide, runbook entries, migrate velocity-frontend-assessment to consume library, visual regression baseline | 8–14 | 1–1.75 |

### Timeline

~8–11 working days. Fits within a single sprint if backend endpoints (Tenant Service branding, HU-42 catalog) are available. If blocked, Phases 1–2 can proceed against mocks (same pattern we used for HU-52).

### Risks / Unknowns

1. **HU-42 readiness** — LabelService and CapabilityService are blocked on the catalog endpoints. BrandingService can proceed independently against Tenant Service.
2. **Tenant Service branding API** — the inheritance walk needs `parentTenantId` in the response. If the ancestry isn't exposed yet, the walk can't be built.
3. **Module Federation singleton alignment** — all consuming MFEs must agree on the library version. A version mismatch at runtime is a hard error, not a graceful degradation.
4. **Private npm registry** — publishing requires a registry (GitHub Packages, Azure Artifacts, or similar). If not provisioned, adds setup time.
5. **Migration scope** — each existing frontend migration is a separate PR with its own testing surface. The assessment MFE (HU-52) is the known first consumer.

### Questions for Owner

1. Which existing frontends must migrate within this story vs. follow-up?
2. Is a private npm registry already provisioned?
3. Are Tenant Service branding hierarchy endpoints available, or do we build against mocks?
4. For visual regression — preferred tool? (Chromatic, Percy, manual screenshots?)
5. Does the library need SSR support, or is client-only acceptable for F1?

---

## What's Deliberately Not Here

- **No composite chrome shells.** The library doesn't export `<adx-admin-chrome>` or `<adx-participant-chrome>`. Each frontend composes its own layout. If duplication appears later, it becomes its own story.
- **No session management.** The library receives session context from the consuming frontend. It doesn't authenticate, refresh tokens, or manage JWTs.
- **No feature components.** No forms, tables, dashboards. This is chrome and platform primitives only.
- **No backend logic.** The library calls APIs for branding, labels, and capabilities. It doesn't define those APIs or own their data.
- **No catalog editing UI.** Branding, labels, and capabilities are administered through their own stories. This library is read-only.

---

## Build Order

1. Library scaffolding + session context interface + `initChromePrimitives()`
2. Design tokens CSS file (base palette, spacing, typography, radii)
3. `BrandingService` + hierarchy walk + `:root` token injection
4. `WordmarkComponent` + `FooterComponent` (consume BrandingService — first visual output)
5. `LabelService` + `adxLabel` pipe + `adxRoleLabel` pipe
6. `CapabilityService` + `*adxIfCapability` directive
7. `AvatarComponent` + `UserMenuComponent` (consume CapabilityService — mat-menu based)
8. Header building blocks (slots)
9. Test suite: all `test_AC{N}` tests + axe-core sweeps
10. Documentation: README, per-primitive guide, migration guide, runbooks
11. Migrate velocity-frontend-assessment to consume the library
12. Visual regression baseline

BrandingService is early (step 3) because it unblocks both the wordmark and the theme tokens — two things that affect every other primitive's visual output. The label and capability layers can proceed in parallel once branding is stable.

---

## Summary

This proposal outlines a shared Angular library of chrome primitives for the Velocity platform. The library provides three resolution engines (branding hierarchy inheritance, per-ISV per-language label fallback, and capability-based UI gating) and a set of Angular Material-based visual primitives (wordmark, footer, avatar, user menu, header slots) that consume them. Design tokens are applied at `:root` via CSS custom properties, automatically theming every consuming component.

The library is published as an npm package with semantic versioning, shared across federated frontends as a Module Federation singleton. Each frontend imports the library, provides session context once, and composes its own chrome layout from the primitives. The estimate spans 56–80 hours across scaffolding, resolution engines, visual primitives, documentation, and migration.
