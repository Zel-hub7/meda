# Running `velocity-frontend-identity` (shell) locally

The shell is the Module Federation **host**. It mounts 3 remotes at runtime: `iam`, `velocityFrontendAssessment`, `velocityFrontendReports`. To get a working dev session you need the shell + all 3 remotes running, talking to the deployed dev backends via the proxy.

This guide reflects the state on `develop` as of 2026-06-08. Supersedes the older `Velocity-Shell-Setup-Rough-Steps.md` for everything except the parts about service principals and ACR access (those are unchanged).

---

## 1. Prereqs

- Node 20.x
- pnpm `10.33.0` (`corepack enable && corepack prepare pnpm@10.33.0 --activate` is the cleanest path)
- A GitHub PAT with `read:packages` scope — needed to install `@apexdynamics/chrome-primitives` from GitHub Packages
- macOS / Linux / WSL — all three work

## 2. Set up `.npmrc` auth (one time)

Every consumer repo has a tracked `.npmrc` pointing the `@apexdynamics` scope to GitHub Packages with `${NODE_AUTH_TOKEN}`. You need that env var set in your shell before `pnpm install`:

```bash
export NODE_AUTH_TOKEN=<your_github_pat_with_read_packages>
# add to ~/.zshrc or ~/.bashrc so it persists
```

Skip this and `pnpm install` fails with `ERR_PNPM_FETCH_401` on chrome-primitives.

## 3. Clone the 4 repos side-by-side

The shell loads the remotes by URL (manifest in `public/module-federation.manifest.json`), but the remotes are separate Angular projects each running their own dev server. Clone them all next to each other:

```bash
mkdir ~/apexdynamics && cd ~/apexdynamics
git clone https://github.com/apexdynamics/velocity-frontend-identity.git
git clone https://github.com/apexdynamics/velocity-frontend-auth.git
git clone https://github.com/apexdynamics/velocity-frontend-assessment.git
git clone https://github.com/apexdynamics/velocity-frontend-reports.git
```

## 4. Install in each

```bash
for d in velocity-frontend-identity velocity-frontend-auth velocity-frontend-assessment velocity-frontend-reports; do
  (cd "$d" && pnpm install --frozen-lockfile)
done
```

If chrome-primitives 401s, your `NODE_AUTH_TOKEN` isn't exported in this shell.

## 5. Ports (canonical, do not change them)

The shell's `public/module-federation.manifest.json` hardcodes these in dev:

- Shell (host): **4200** — what you open in browser
- `iam` remote (velocity-frontend-auth): **4201**
- `velocityFrontendAssessment`: **4202**
- `velocityFrontendReports`: **4203**

If any remote runs on the wrong port, the shell silently 404s when you navigate to its routes.

## 6. Start everything (4 terminals)

```bash
# Terminal 1 — iam remote (auth screens)
cd velocity-frontend-auth && pnpm start --port 4201

# Terminal 2 — assessment remote (Quick Invite, take-flow, My Tasks)
cd velocity-frontend-assessment && pnpm start --port 4202

# Terminal 3 — reports remote
cd velocity-frontend-reports && pnpm start --port 4203

# Terminal 4 — SHELL (last)
cd velocity-frontend-identity && pnpm start
```

Start the remotes BEFORE the shell. Each takes ~20-30s for first compile. Shell's first compile + remote-entry fetches takes another 20s.

Open http://localhost:4200 in a Chrome incognito window.

## 7. Backend — you don't need to run BE locally

The shell's `proxy.conf.cjs` proxies `/api/*` to **`https://app-apxd-dev-backend.azurewebsites.net`** (deployed dev). So:

- `/api/auth/login` → hits deployed Identity service
- `/api/me/context` → hits deployed Identity
- `/api/accounts/participants` → hits deployed Assessment

Translation: when you log in locally, you're logging into the SAME dev DB as everyone else. Use the seeded test accounts:

- Admin: `e2e.admin@example.com` / `E2eAdmin1234!`
- Participant: `e2e.participant@example.com` / `E2ePart1234!`
- Or Zola's `active.user@example.com` (password in his password manager — ping him)

## 8. Common errors and fixes

**`ERR_PNPM_FETCH_401` on `@apexdynamics/chrome-primitives`**
→ `NODE_AUTH_TOKEN` not exported in your shell. Re-export and re-run `pnpm install`.

**`Loading chunk N failed` or `Failed to fetch dynamically imported module .../remoteEntry.js`**
→ A remote isn't running on its expected port. Confirm 4201, 4202, 4203 are all up.

**Shell loads but everything 401s on `/api/*` calls**
→ Deployed BE issued a session cookie scoped to `app.dev.velocityadmin.io`. Local doesn't get it. **Workaround:** log in once locally — the proxy + dev BE will issue you a fresh cookie scoped to `localhost:4200`. From there on, every API call carries that cookie.

**Login redirects to `app.dev.velocityadmin.io` then back to `localhost:4200` and breaks**
→ The IAM redirect URL is environment-dependent. There's a hosts trick: add `127.0.0.1 lencora.host` to `/etc/hosts` and open `http://lencora.host:4200`. The shell's `allowedHosts` already includes it.

**`NG0201: No provider found for InjectionToken IAM_CONTEXT_LOADER` (or similar)**
→ One of the remotes is stale. Restart all 3 remotes.

**`Cannot read properties of undefined (reading 'hasAttached')` from CDK dialog**
→ A known Module Federation singleton race for `@angular/cdk/dialog` that we fixed in shell PR #64. Make sure you're on `develop` HEAD, not an older branch.

**Hot reload makes the shell forget the remotes**
→ After editing remote code, sometimes the remote's chunk hash changes and the shell still references the old hash. Hard refresh (Cmd+Shift+R) the shell tab.

**Login succeeds but you land on a blank/temporary scaffold page**
→ This is the temp scaffold home; the role-aware redirect (shell PR #77) sends you to `/assessment/quick-invite` (admin) or `/assessment/tasks` (participant). If you stay on the scaffold, `activeRoles()` hasn't hydrated — check DevTools Network for `/me/context`.

## 9. Where to look when something breaks

- **Module Federation manifest:** `public/module-federation.manifest.json` (the 4200-4203 mapping)
- **Webpack MF config:** `webpack.config.js` at shell root (defines remotes + shared singletons)
- **Proxy rules:** `proxy.conf.cjs` (the `/api → deployed BE` rewrite)
- **Env config:** `src/environments/environment.ts` (local dev) vs `environment.production.ts` (CI build)
- **Allowed hosts:** `angular.json` → `projects.shell.architect.serve.options.allowedHosts`

## 10. If you only need to debug ONE issue and the full stack is overkill

You can run JUST the shell against the **deployed remotes** by editing `public/module-federation.manifest.json` to point at the production URLs (not localhost). The values are in the template file (`public/module-federation.manifest.json.template`) — copy the deployed URLs from `https://app.dev.velocityadmin.io/module-federation.manifest.json`. **Don't commit that change**; it's a personal dev shortcut.

## 11. Why the README in `velocity-frontend-identity` is misleading

The repo's `README.md` was written when the shell was a hello-world scaffold (Angular 20, `npm install`, no remotes). Don't follow it. The current stack is Angular 21, pnpm, full MF host with 3 remotes — this guide is the source of truth until the README catches up.

---

**Quick reference card — paste in a terminal note:**

```
shell    → 4200    (velocity-frontend-identity)
iam      → 4201    (velocity-frontend-auth)
assess   → 4202    (velocity-frontend-assessment)
reports  → 4203    (velocity-frontend-reports)
BE       → proxied to https://app-apxd-dev-backend.azurewebsites.net
admin    → e2e.admin@example.com / E2eAdmin1234!
parti    → e2e.participant@example.com / E2ePart1234!
```
