# Detecting which Statsig project a page belongs to

Goal: know if the Console API key stored in the extension actually belongs to the Statsig
project the current page is using, and support several projects (one Console key per project).

All findings below were verified live on 2026-09-04 against real sites.

## 1. What a page exposes

### Client SDK key (`client-…`) — the anchor

The page always initializes with a **client SDK key**. It is public. Verified locations:

| Vector                                         | Where                                     | statsig.com                                          | cloud.qdrant.io                                                                  |
| ---------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `__STATSIG__.instances` keys                   | main world                                | `client-XlqSMkAavOmrePNeWfD0fo2cWcjxkZ0cJZz64w7bfHX` | `client-azDVKQnE5MmDj3YmdCGS6RFSZcTPYE0J4Hxj3qaREEu`                             |
| `firstInstance.getContext().sdkKey`            | main world                                | same                                                 | same                                                                             |
| `__STATSIG__.srInstances` / `acInstances` keys | main world (session replay / autocapture) | same                                                 | –                                                                                |
| App bootstrap config in HTML                   | `__QDRANT_CLOUD__.statsig.client_key`     | –                                                    | same                                                                             |
| `?k=client-…` query param                      | `/v1/initialize` (or proxy) + `/v1/rgstr` | yes                                                  | yes (`cloud.qdrant.io/v1/feature-config?k=…`, `prodregistryv2.org/v1/rgstr?k=…`) |

`getContext()` returns `{ sdkKey, options, values, user, errorBoundary, session, stableID, sdkInstanceID }`
— the extension already ships this context to the popup (`useContextStore.detectedContext`), it just
never reads `sdkKey`.

### Hashed key (`hashed_sdk_key_used`) — works when the key is hidden

The evaluation payload carries the server-side hash of the key used:

- `getContext().values.hashed_sdk_key_used`
- `localStorage['statsig.cached.evaluations.<n>'] → JSON.parse(data).hashed_sdk_key_used`

It is `DJB2(sdkKey)` (statsig variant, seed 0, `h = (h<<5) - h + charCode`, unsigned):

```
DJB2("client-azDVKQnE5MmDj3YmdCGS6RFSZcTPYE0J4Hxj3qaREEu") = 2447027979  = hashed_sdk_key_used
DJB2("client-XlqSMkAavOmrePNeWfD0fo2cWcjxkZ0cJZz64w7bfHX") = 2414204405  = hashed_sdk_key_used
```

This is the fallback for **bootstrapped** apps: statsig.com initializes from
`window.statsigInitializeValues`, so `getContext().values` is empty — but the localStorage cache
still contains `hashed_sdk_key_used`. One-way hash, so it only works to _verify a candidate key_,
never to recover one.

Other localStorage entries (`statsig.stable_id.<n>`, `statsig.session_id.<n>`) use a different,
non-obvious derivation of the key — useful only as an "SDK is present" signal.

### Entity fingerprint — works with no key access at all

`values.feature_gates` / `values.dynamic_configs` keys are `DJB2(entityName)` when
`values.hash_used === "djb2"` (default; can also be `"sha256"` or `"none"` → plaintext names).
Verified against the Console API for the Qdrant project:

- 56 gate hashes on the page, 57 gates in `/console/v1/gates` → **56/56 matched** (0 unexplained)
- 6 config hashes on the page, 4 in `/console/v1/dynamic_configs` → 4 matched (the other 2 are
  experiments/layers, which live in `dynamic_configs` in the payload)

So hashing the gate names the extension _already fetches_ and intersecting with the page payload
identifies the project with no extra API scope.

### Environment

- `getContext().options.environment.tier` and `user.statsigEnvironment.tier` → `"production"` on
  cloud.qdrant.io.
- Each CLIENT key in the Console API reports its `environments` (see below).

Both let the extension preselect the right environment for overrides instead of defaulting blindly.

## 2. What the Console API gives us

`GET /console/v1/keys?limit=100` (verified with a Qdrant Console key) returns **full, unmasked key
values** for every key in the project:

```jsonc
{ "key": "client-azDVKQnE5MmDj3YmdCGS6RFSZcTPYE0J4Hxj3qaREEu", "type": "CLIENT",
  "description": "Production", "environments": ["production"], "status": "active" }
{ "key": "client-Y2dPslTvfL2RTAacowWsjeFQGvhyJ1x3h7czrXwCWc9", "type": "CLIENT",
  "description": "Development/local", "environments": ["development"], "status": "active" }
```

That is a direct `client-… → project + environment` mapping.

Caveat: it requires the `can_access_keys` scope. Of the Qdrant Console keys, only some have it
(the one described as `chrome extension` has `omni_read_write` only), so this path must degrade
gracefully to the fingerprint method.

Other notes:

- `GET /console/v1/environments` works with plain read scope (`development`/`staging`/`production`).
- There is no project-name endpoint (`/projects`, `/target_apps` → 404) and audit logs carry no
  project id — so a project has to be labelled by the user, or by the key description / first
  detected origin.

## 3. Matching, cheapest signal first

Implemented in `matchProject` (`src/lib/projects.ts`):

```
detected = { sdkKeys[], hashedSdkKeys[], gateHashes[] }
1. origin pinned to a project by the user                → wins over everything
2. sdkKey ∈ project.clientKeys                           → exact  (needs can_access_keys)
3. djb2(clientKey) ∈ hashedSdkKeys                       → exact  (bootstrapped pages)
4. |gateHashes ∩ project.gateHashes| ≥ 3 and ≥ 50% of the smaller of the two lists
                                                         → strong (no extra scope)
```

Outcomes:

- one match → `useProjectMatching` activates that project and clears the query cache
- **no match → nothing is loaded at all.** The popup replaces the gates/experiments/configs/audit
  tabs with `PageProjectGate`, which names what was detected and takes the Console API key of the
  project the page actually uses. Showing another project's entities on a site it does not own is
  worse than showing nothing, so it never happens — this covers all three non-matching states
  (`unknown-project`, `unverifiable`, `no-statsig`)
- a key added from that panel pins the current origin to its project (`useAddProject(key, true)`),
  so it keeps winning there even when the project cannot be fingerprinted
- picking a project by hand also pins the current origin to it, which is the only option on sites
  that evaluate Statsig server-side

`clientKeys` and the gate hashes are cached per project (they change rarely) and re-read on demand
with the refresh button, since a brand-new client key would otherwise look like a foreign project.

## 4. What ships

- `src/lib/get-user-details-injector.ts` — `getUserDetailsFromPage` also returns `keys`
  (`sdkKeys` from `instances`/`srInstances`/`acInstances`/`getContext()`, `hashedSdkKeys` and
  `gateHashes` from `values` and from the cached-evaluations fallback in `localStorage`). The popup
  injects it with `scripting.executeScript` (`src/handlers/get-user-details.ts`), which **serializes
  the function on its own**: every helper it uses must be declared inside it, imports and
  module-level constants are not available in the page.
- `src/hooks/use-detected-statsig-keys.ts` — runs that injection on popup open and stores the result
  in `useContextStore.detectedKeys`. Note that `entrypoints/statsig-detector.ts` is **not**
  registered in the manifest (WXT only registers `*.content.ts` entrypoints), so the
  `postMessage` path in `entrypoints/content.ts` never receives anything: `executeScript` is the
  only detection that runs.
- `src/lib/storage.ts` — `projectsStorage` (a list of `StatsigProject`) plus
  `activeProjectIdStorage`; `apiKeyStorage` is kept as the mirror of the active project's key, so
  `entrypoints/background.ts` stays unchanged. A previously stored single key is migrated into the
  first project on startup.
- `src/handlers/project-fingerprint.ts` — `GET /console/v1/keys`, falling back to
  `GET /console/v1/gates` hashes when the Console key lacks `can_access_keys`.
  `useBackfillProjectFingerprints` fills this in for projects that have no identifiers yet
  (migrated keys), otherwise they could never be matched.
- UI — the header shows a `ProjectStatus` chip with one of four states (`matched`,
  `unknown-project`, `unverifiable`, `no-statsig`), `ProjectsSettings` spells the same state out in
  words next to the project list, and `PageProjectGate` takes over the main area whenever the state
  is not `matched`. All three read `usePageProject`, which adds a fifth `pending` state so nothing
  is claimed (nor blocked) before the page has been inspected.
- Not done: preselecting the environment from the client key's `environments` / `envTier`.

## 5. Limits found

- **Server-side / edge evaluation is undetectable.** chatgpt.com (logged out) evaluates Statsig in a
  Cloudflare Worker: no `window.__STATSIG__`, no `client-` key in the HTML, zero `statsig` strings in
  the document; the only trace is their own proxied `/unauth-mweb/events/statsc/flush` endpoint and
  `server_timing_statsig_*` metrics. Nothing to match against — the extension can only fall back to
  a manual origin → project mapping.
- A same-origin proxy (`cloud.qdrant.io/v1/feature-config`) does not hide anything: the key is still
  in the `?k=` param and in `instances`.
- `hash_used: "sha256"` needs a SHA-256 fingerprint variant; `"none"` gives plaintext names.
- Multiple instances on one page are possible (`instances` is a map) — handle N keys, not one.
- `/console/v1/gates` returns at most 100 gates, so the fingerprint compares the overlap against the
  smaller of the two gate lists; measuring it against the page payload would never match a project
  with more than 100 gates.
