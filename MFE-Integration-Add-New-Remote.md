# MFE Integration — Add a New Remote to the Velocity Shell

> Step-by-step, copy-paste-ready instructions to integrate a new repo as a Module Federation remote into the `velocity-frontend-identity` shell.
>
> Example used throughout: integrating a hypothetical `velocity-frontend-reports` repo (bounded context: reports). Swap the names out for your actual ones.

---

## PART A — On the new `velocity-frontend-reports` repo

### A1. Install the Module Federation tooling

```bash
pnpm add -D @angular-architects/module-federation
npx ng add @angular-architects/module-federation --project reports --port 4203
```

Pick port **4203** (4200 = shell, 4201 = iam, 4202 = assessment, 4203 = reports — next free in the convention).

### A2. Edit `webpack.config.js` at the repo root (copy from `velocity-frontend-assessment` as the template)

```js
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const BUILD_TIME_ONLY = new Set([
  'tailwindcss', '@tailwindcss/postcss', '@tailwindcss/node',
  'jiti', 'lightningcss', 'postcss', 'prettier',
]);

const shared = Object.fromEntries(
  Object.entries(
    shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  ).filter(([pkg]) => !BUILD_TIME_ONLY.has(pkg)),
);

module.exports = withModuleFederationPlugin({
  name: 'velocityFrontendReports',     // camelCase remote name — must match shell manifest key
  filename: 'remoteEntry.js',
  exposes: {
    './Routes': './src/app/feature/feature.routes.ts',
    // add other exposed components if needed, e.g. './ReportWidget'
  },
  shared,
});
```

### A3. Create the exposed routes file `src/app/feature/feature.routes.ts`

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-home/reports-home.component').then(
        (m) => m.ReportsHomeComponent,
      ),
    // Add `data: { layout: 'bare' }` ONLY on routes that should bypass the shell chrome
    // (per ADR-020 — admin routes leave it off; participant-style full-screen routes set it).
  },
  // ... your other reports routes
];
```

### A4. Consume the shell-owned singletons via `@apexdynamics/chrome-primitives`

Don't reimplement `TokenService`, `BrandingService`, `IamContextService`, etc. Add the package as a dependency:

```bash
pnpm add @apexdynamics/chrome-primitives
```

Then `inject(TokenService)` etc. in your services. Under Module Federation the shell-provided singleton wins; in standalone-dev a stub seeds from `localStorage` (see how `velocity-frontend-assessment` does it in `src/app/shared/auth/dev-token-seed.ts`).

### A5. Configure the dev proxy (`proxy.conf.json`)

Mirror what `velocity-frontend-assessment` has. Routes any API calls through to the right backend in standalone-dev.

### A6. Confirm the build outputs `dist/reports/remoteEntry.js`

```bash
pnpm run build --configuration production
ls dist/reports/remoteEntry.js   # must exist
```

---

## PART B — On the `velocity-frontend-identity` (shell) repo

### B1. Add the remote to the manifest template

File: `public/module-federation.manifest.json.template`

```json
{
  "iam": {
    "name": "iam",
    "type": "module",
    "remoteEntry": "${IAM_REMOTE_URL}"
  },
  "velocityFrontendAssessment": {
    "name": "velocityFrontendAssessment",
    "type": "module",
    "remoteEntry": "${ASSESSMENT_REMOTE_URL}"
  },
  "velocityFrontendReports": {
    "name": "velocityFrontendReports",
    "type": "module",
    "remoteEntry": "${REPORTS_REMOTE_URL}"
  }
}
```

Also update `public/module-federation.manifest.json` (the local-dev version) with `http://localhost:4203/remoteEntry.js` for the same key.

### B2. Add the route in `src/app/app.routes.ts`

Copy the assessment block, change the names:

```ts
{
  path: 'reports',
  canActivate: [authGuard, tenantContextGuard],
  loadChildren: () =>
    loadRemoteWithStyles<{ routes: Routes }>({
      remoteName: 'velocityFrontendReports',   // must match manifest key
      exposedModule: './Routes',
    })
      .then((m) => m.routes)
      .catch((err) => {
        console.error('[shell] reports remote failed to load:', err);
        return import('./shared/ui/remote-unavailable/remote-unavailable.routes').then(
          (m) => m.routes,
        );
      }),
},
```

### B3. (Only if reports has its own backend) Add a BFF block to `nginx.conf.template`

If the reports FE calls `/api/reports/*` and you want the shell to synthesize `Authorization: Bearer` from the HttpOnly cookie (same as the take-assessment BFF block in shell PR #65), add:

```nginx
location ^~ /api/reports/ {
    proxy_pass https://reports.${ENV_DOMAIN};
    proxy_ssl_server_name on;
    proxy_set_header Host reports.${ENV_DOMAIN};
    proxy_set_header Authorization "Bearer $cookie_access_token";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}
```

Then on the reports FE side, use the relative path `/api/reports/*` instead of the absolute backend URL.

### B4. Update `docs/mfe-integration.md` — add a row in the "Topology consumed" table

Per the existing doc convention, add a row:

```
| `velocityFrontendReports` | `velocity-frontend-reports` | Reports domain | `4203` | `./Routes` → `src/app/feature/feature.routes.ts` | `/reports` | None — remote owns its sub-tree |
```

### B5. Infra side — `velocity-infrastructure` repo

Add a new Azure App Service binding for the reports container + the `REPORTS_REMOTE_URL` env var that points at it (e.g. `https://app-apxd-dev-frontend-reports.azurewebsites.net/remoteEntry.js`). Mirror the assessment FE pattern in the Terraform modules.

---

## PART C — Quick smoke test

1. **Standalone dev:** in the reports repo, `pnpm start` (boots on `:4203`). Visit `http://localhost:4203` — should render the reports home page on its own.
2. **MF-host dev:** in the shell repo, `pnpm start` (boots on `:4200`). Visit `http://localhost:4200/reports` — shell loads, the reports remote streams in via `:4203/remoteEntry.js`, you see the page rendered inside the shell chrome.
3. **Deployed:** after CI/CD pushes both images to ACR and Terraform binds the App Services, `app.dev.velocityadmin.io/reports` should resolve.

---

## Notes

- The shell uses `@angular-architects/module-federation@21.2.2`. Match that version exactly in the new repo or singleton-version negotiation breaks at runtime.
- Don't expose anything other than `Routes` unless the shell needs to embed a specific component (Quick Invite is the only such case in the assessment remote).
- The `@apexdynamics/chrome-primitives` library version must match across all remotes — keep `pnpm-lock.yaml` aligned (currently `0.3.0` on assessment + shell).
- Reference implementation: `velocity-frontend-assessment` is the cleanest current example — copy its `webpack.config.js`, `proxy.conf.json`, `src/app/feature/feature.routes.ts`, and `src/app/shared/auth/dev-token-seed.ts` as scaffolding for the new repo.
