# Velocity Shell — Setup Rough Steps

A reference for what it takes to stand up a "full shell" in the Velocity
Module Federation host model: what the shell does, where the contracts are
documented, and the concrete steps to wire one from zero.

---

## What "the shell" actually is

The shell is the **Module Federation host**. In Velocity that role is owned
by `velocity-frontend-identity`. It does **not** own any domain UI; it owns
the runtime composition surface that lets remote MFEs (auth, assessment, and
future product MFEs) load and render inside one browser context with a
single auth session.

Three responsibilities sit with the shell, and only with the shell:

1. **Application chrome.** Header, footer, main layout, top-level navigation
   — for the default chrome variant. Routes that need a different chrome
   declare `data: { layout: 'bare' }` and the shell renders only
   `<router-outlet>`.
2. **Route table and remote mounting.** Lazy-loads each remote's exported
   `Routes` module at a path prefix (`/iam`, `/assessment`, etc.), with
   shell-owned orchestration routes (`/iam/callback`, `/iam/no-access`)
   listed before the remote's empty path so they shadow.
3. **Shared singletons across host ↔ remote.** JWT (`TokenService`),
   active-tenant context (`IamContextService`), branding
   (`BrandingService`), and theme/locale services — all distributed once
   across host and every remote via `shareScope: 'default'`.

Everything else lives in remote MFEs.

---

## Where this is documented

Three layers, from the architectural "why" to the per-MFE wiring "how":

| Layer | Source | What it gives you |
|---|---|---|
| **Architecture decision** | [`apexdynamics-docs/adr/ADR-020 — Frontend Composition: Thin Shell with Per-MFE Chrome`](https://github.com/apexdynamics/apexdynamics-docs/blob/main/adr/ADR-020-frontend-composition-thin-shell-with-mfe-chrome.md) | Why thin shell + per-MFE chrome, options considered, operational requirements, what the ADR does **not** decide. |
| **Auth / singleton contract** | [`apexdynamics-docs/VELOCITY-PLATFORM-ARCHITECTURE-BASELINE.md` § 6.1](https://github.com/apexdynamics/apexdynamics-docs/blob/main/VELOCITY-PLATFORM-ARCHITECTURE-BASELINE.md) | JWT lifecycle, `TokenService` interface, MF singleton via `shareScope: 'default'`, refresh model, why no `window.fetch` patching. |
| **Current concrete shell state** | `velocity-frontend-identity/docs/mfe-integration.md` (Baseline § 6.3 artifact) | Topology table of every consumed remote, dev ports, exposed modules, mount paths, shared singletons, auth flow, screen scope, open items. |
| **Per-MFE consumer steps** | [`velocity-frontend-chrome-primitives/docs/MIGRATION.md`](https://github.com/apexdynamics/velocity-frontend-chrome-primitives/blob/main/docs/MIGRATION.md) — section 11 (Shell-side ADR-020 contract) | What to add to the shell's `webpack.config.js` `exposes` when consumer migration starts, plus the per-MFE wiring on the remote side. |

For a new team member or a backend dev orienting on the shell, start with
ADR-020 (15 minutes), then read the topology table at the top of
`mfe-integration.md` (5 minutes). That is enough context to follow most
conversations about the shell.

---

## Rough steps for a full shell, from zero

1. **Angular host with Module Federation.** Standalone Angular 21+, dev
   server on port 4200, `@angular-architects/module-federation` (or native
   Module Federation in newer Angular versions). `webpack.config.js` uses
   `withModuleFederationPlugin`.
2. **`shared` dependency map.** Apply `shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })`
   so every Angular and RxJS dep resolves once across host and every remote.
   Explicitly exclude build-time-only packages (tailwind, postcss, jiti,
   lightningcss, prettier) — they must never enter the browser bundle.
3. **`exposes` map for shell-owned singletons.** Per ADR-020 the shell
   exposes `BrandingService` so remote MFEs can consume the host's resolved
   instance with its tenant-walk state. Eventually `IamContextService`,
   `ThemeService`, and `LocaleResolverService` follow the same path as
   their cross-MFE consumers appear. Without these in `exposes`, every
   remote runs its own local instance and the singleton contract is broken
   even if the package is shared.
4. **Runtime remote manifest.** `public/module-federation.manifest.json`
   listing every remote with its `remoteEntry.js` URL. Per-environment
   variants (`*.dev.json`, `*.staging.json`, `*.prod.json`) selected at
   deploy time. **Frontend code never hardcodes a remote URL** — that
   has bitten this team before.
5. **Remote loader with fallback.** A `loadRemoteWithStyles<T>` wrapper
   around `loadRemoteModule({ type: 'manifest', remoteName, exposedModule })`
   that resolves the route to a `RemoteUnavailable` component when the
   remote 404s or fails to mount.
6. **Top-level route table.** Lazy-load each remote's `Routes` at a path
   prefix. Shell-owned orchestration routes (`/iam/callback`,
   `/iam/no-access`, `/404`) listed **before** the remote's empty path so
   they shadow any colliding route the remote might ship.
7. **Layout component with `layout: bare` honoring.** The shell layout
   reads `route.data?.layout`. Default or `'default'` → renders shell
   chrome (header, nav, footer). `'bare'` → renders only `<router-outlet>`
   so the remote MFE owns its full chrome end-to-end. Walk
   `ActivatedRoute.firstChild` to read the deepest matched child's data —
   Angular's default behavior reads parent route data, which gives the
   wrong answer here.
8. **JWT plumbing per Baseline § 6.1.** Shell holds the JWT in memory and
   owns the refresh lifecycle. `TokenService` exposes `getToken(): string | null`
   and `refresh(): Promise<string>` (or your variant — see "Open items"
   below). Every outgoing request from any remote attaches the bearer via
   either an Apollo `setContext` link (for GraphQL) or an Angular
   `HttpInterceptor` (for REST), both calling `inject(TokenService)`.
   **Never patch `window.fetch`** — it conflicts with Apollo's link chain
   and is bypassable.
9. **Standalone-dev mode.** The shell must serve alone on `:4200` even
   when the remotes aren't running — `RemoteUnavailable` fills in for
   missing remotes. Each remote ships a `Dev*Service` stub (sourced from
   `localStorage` or env) so it can also run alone without the shell, for
   isolated dev. Stubs are **never** included in the production build.
10. **`docs/mfe-integration.md` (mandatory artifact).** Per Baseline § 6.3,
    every shell repo enumerates: every remote it consumes (with
    per-environment `remoteEntry.js` URLs), the shared singleton scope,
    auth flow, screen scope, open items. PR-blocked if missing or stale.

---

## Where our current shell stands

`velocity-frontend-identity` has items 1, 2, 4, 5, 6, 7 (partially), 9, and
10 wired up. The open items the integration doc itself calls out:

- **Item 3 (`exposes` map) is empty.** The shell currently declares no
  `exposes` at all. Singleton resolution today works because each MFE
  declares `@apexdynamics/chrome-primitives` as a shared package with
  `singleton: true`, so the whole library resolves once across host +
  remotes. That is *a* valid MF singleton mechanism, but it is **not**
  what ADR-020 prescribes: the ADR says the shell should expose specific
  services so remotes consume the host's resolved instance, not a
  separately-resolved copy of the same class.
- **Item 8 (Baseline § 6.1 interface) is partially aligned.** The library
  ships `TokenService` with `activeBearer() / setTokens() / rotateTokens() / clear()`;
  § 6.1 prescribes `getToken() / refresh()`. The MF version-mismatch crash
  that blocked the unauth `/me/context` is fixed (three singleton-version
  PRs merged), but the literal interface contract is a separate
  architectural call that has not been made yet.

Both are tracked at the bottom of `docs/mfe-integration.md` under "Open
items / contract deltas".

---

## What ADR-020 explicitly does NOT decide

Worth knowing so you do not chase architecture decisions in the wrong
place:

- **Specific chrome variants per role or surface** (admin chrome,
  participant chrome, focus chrome for assessment-taking) are user
  stories that *consume* this ADR. ADR-020 defines the composition
  mechanism, not the variants.
- **Branding data schema in Tenant Service** is covered by Baseline
  § 5.1 (Tenant Service owns branding).
- **Extraction of a shared `@apexdynamics/chrome-kit` library** was
  deferred to F2. It exists today as
  `velocity-frontend-chrome-primitives` and the public README documents
  the F1-vs-F2 framing explicitly.

---

## Quick orientation for backend engineers

If you mostly work backend and need to follow shell conversations:

- **"The shell"** = the Module Federation host. Today that is
  `velocity-frontend-identity`, regardless of the name.
- **"A remote" / "an MFE"** = an Angular app that exposes a `Routes`
  module via Module Federation. The shell mounts it under a path prefix.
- **"Singleton" in this context** = a service that resolves to a single
  instance across the host and every remote, distributed via
  `shareScope: 'default'`. This is how JWT and branding stay consistent
  no matter which MFE the user is currently inside.
- **"`layout: bare`"** = the route flag that tells the shell *"do not
  render your chrome here, the remote will render its own."*
- **"Federation"** in our usage = Module Federation (a webpack runtime
  feature), not GraphQL federation. Two completely different concepts
  that share the word.

The cleanest mental model: the shell is a thin webpage that knows how to
load other Angular apps on demand and keep them all signed in to the same
backend with the same active tenant context. Everything else is policy
about which chrome shows up and which singletons cross the boundary.
