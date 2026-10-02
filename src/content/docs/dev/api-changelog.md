---
title: API Changelog
description: Changes to the RocketFlag Management API and Evaluation API, newest first.
---

This page lists changes to RocketFlag's public APIs. Each entry says which API it affects and whether it needs any action from you.

### Our compatibility promise

The Management API (`/api/v1`) is **additive only**. Within a version:

- Fields are only ever **added** to responses. They are never renamed, retyped or removed.
- New optional request fields and new endpoints may appear.
- A change to how existing behaviour works gets a **new version**, served alongside the old one, instead of changing `v1` under you.

Write your scripts to ignore fields they do not recognise, and they will keep working.

---

### 2.9.0

Released 1 October 2026, together with evaluation release `eval-v1.1.0`.

#### Management API v1

The Management API is available on the Teams and Enterprise plans. See the [Management API reference](/api/management/). API tokens and audiences are a **Preview** first iteration and may change.

- `GET /api/v1/token` describes the calling token: project, permission, environments and expiry.
- `GET /api/v1/flags` lists flags, with an exact-match `?name=` filter.
- `GET /api/v1/flags/{id}` returns one flag. `?env=` projects a group flag to a single environment.
- `POST /api/v1/flags` creates a flag, flat on single-environment projects and with `environments` on multi-environment ones.
- `PATCH /api/v1/flags/{id}` changes a flag with merge patch semantics: present keys replace, absent keys are untouched, `cohorts: []` clears, `audienceId: null` detaches an audience. A patch that changes nothing returns `"changed": false` and writes nothing.
- Authentication is a bearer token (`rf_...`) created in the console, with `read` or `write` permission and an optional environment restriction.
- Every error uses one envelope, `{error, detail, docs}`, and the `docs` link points at the section of the reference that explains it.
- `audienceId` is present on every flat flag representation, and on each entry of `environments`. It is `null` when the flag has no audience.

#### Evaluation API

The additions below to `GET /v1/flags/{flag_id}` and `GET /v1/flags/project/{project_id}` need no action, but three behaviours change, and they come first.

- **Behaviour change: an invalid cohort on the project route is a `400`.** `GET /v1/flags/project/{project_id}` with a `cohort` that cannot be decoded now returns `400 Bad Request`, the same as the single-flag route. It used to return `200` with an empty list, which was indistinguishable from a project with no flags. If your code treats an empty list from this route as "no flags", check that it also handles a `400`. Requests with a valid or absent `cohort` are unaffected.

- **Behaviour change: cohort matches are always on.** A request whose `cohort` matches the flag's cohorts now evaluates to `true` regardless of the traffic percentage. Previously a matching cohort still had to pass the percentage, so a cohort-gated flag below 100% was off for some matching cohort members. Flags with no cohorts, or with cohorts at 100%, behave as before.
- **Behaviour change: sticky percentage rollouts.** Send `targetingKey` (a stable id such as a user id) and a flag below 100% gives that key the same answer on every request, instead of a fresh random draw each time. If you send only `cohort`, the cohort is used as the bucketing key, so those requests are now sticky too. A request that carries neither key is still a random roll on every request, as it always was.
- **Attributes.** Any other query parameter is passed to the flag as an attribute for [audience](/guides/audiences/) matching, for example `?plan=pro&country=AU`. `targetingKey`, `cohort` and `env` keep their own meanings and are not treated as attributes.
- **Audiences.** A flag can now use a project [audience](/guides/audiences/), a named set of attribute rules, in addition to cohorts. Audiences are exact-match rules. There is no regex, no version comparison and no numeric comparison. Audiences are available on the Teams and Enterprise plans.

The [SDKs](/dev/node-sdk/) pass `targetingKey` and attributes through their existing context objects, so there are no signature changes. In TypeScript, cast the context to `UserContext` until the next Node and React SDK release widens the type (see the SDK pages).
