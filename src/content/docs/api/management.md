---
title: Management API
description: Read and change flags from scripts and CI with a bearer token. List, get, create and patch flags over HTTPS.
---

The Management API lets a script, a deploy pipeline or an internal tool read and change the flags in one project. It is small and flat: four flag endpoints, one introspection endpoint, JSON in and JSON out.

:::caution[Preview]
API tokens and this API are a first iteration. They are marked **Preview** in the console and may change as we learn how teams use them. The changelog lists every change.
:::

It is separate from the [Evaluation API](/dev/api-reference/), which your applications call to ask "is this flag on for this user?". The Management API changes what the answer is going to be.

## Base URL

```text
https://api.rocketflag.app
```

Every route lives under `/api/v1`.

| Method and path | What it does | Token permission |
| :--- | :--- | :--- |
| `GET /api/v1/token` | Describes the token you are calling with | read |
| `GET /api/v1/flags` | Lists the project's flags | read |
| `GET /api/v1/flags/{id}` | Returns one flag | read |
| `POST /api/v1/flags` | Creates a flag | write |
| `PATCH /api/v1/flags/{id}` | Changes a flag's state | write |

There is no delete, no rename, and no way to edit a flag's description or tags through the API. Those stay in the console. Audience definitions are also managed in the console: the API only lets you attach or detach an audience on a flag with `audienceId`.

---

## Auth

Send a token in the `Authorization` header on every request:

```bash
curl https://api.rocketflag.app/api/v1/flags \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

Token secrets start with `rf_`. The token itself also has an id (a 20-character id, shown in the console and by `GET /api/v1/token`), which is not the secret. You create tokens in the console under **Project > Tokens**. A token belongs to one project, so you never pass a project id: the token decides which project you are talking to.

Each token has:

| Setting | Meaning |
| :--- | :--- |
| **Permission** | `read` can call the `GET` routes. `write` can also create and patch flags. |
| **Environments** | Optional. On a multi-environment project you can limit a token to specific environments (such as `staging` only) using checkboxes, or choose **All** for all environments. The limit is stored by environment name, so renaming an environment does not update tokens limited to it: their requests for that environment are refused until you revoke them and create new ones. The console marks the stale name on the token's page. |
| **Expiry** | Optional. A token with an expiry stops working after that time. |

The Management API is available on the **Teams and Enterprise plans**, and to organisations on an active Teams trial. If the organisation moves to a plan without it, or a trial ends, calls return `402` until it is back on Teams or Enterprise. The same applies while the organisation's subscription has lapsed, for example over an unpaid invoice: every call, reads included, returns `402` until the subscription is back in good standing. Tokens do not need to be recreated afterwards. In the console, an organisation below Teams can still see its existing tokens on **Project > Tokens**, read-only: it cannot create, rotate or revoke them there.

### Creating and managing tokens

- **Where.** Tokens belong to organisation projects. A personal project cannot have tokens.
- **Who.** An Editor, Admin or Owner can create a token. Revoking or rotating a token is open to the person who created it and to any Admin.
- **Environments.** On a multi-environment project, the creation dialog offers a checkbox for each environment label plus an **All** checkbox. **All** is ticked by default and gives access to all environments (including future ones). Unticking **All** allows you to select one or more specific environments.
- **Expiry.** The console offers Never, 30 days, 90 days and 365 days. A token can last at most 365 days.
- **Limit.** A project can have at most 50 active tokens. An expired token that has not been revoked still uses a slot, so revoke tokens you no longer need.
- **Activity.** Each token has its own page in the console. It shows when the token was last used, its recent activity and any recent denials.

| Status | Cause |
| :--- | :--- |
| `401` | The header is missing or malformed, the token is unknown, revoked or expired. |
| `402` | The organisation is not on the Teams or Enterprise plan (or an active Teams trial), or its subscription has lapsed. Every call returns this until the organisation is back in good standing. |

```json
{
  "error": "Missing bearer token",
  "detail": "Send Authorization: Bearer rf_... with a token created in the console",
  "docs": "https://docs.rocketflag.app/api/management#auth"
}
```

:::note
Revoking a token takes effect within about a minute, because the API caches token lookups for up to 60 seconds. If you suspect a leak, revoke first and investigate after.
:::

---

## Token

`GET /api/v1/token` describes the token that made the request. Use it at the top of a script to fail early if a credential cannot do what you need.

```bash
curl https://api.rocketflag.app/api/v1/token \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

```json
{
  "id": "Tk6eW3hB9uLa1NxQ5oSd",
  "name": "GitHub Actions",
  "project": { "id": "Pj2cV8yN4bRk7ZsD1qXm", "name": "Storefront" },
  "permission": "write",
  "environments": ["staging"],
  "expiresAt": 1798675200000
}
```

| Field | Notes |
| :--- | :--- |
| `permission` | `read` or `write`. |
| `environments` | The environments the token is limited to. An empty array means every environment. Never `null`. |
| `expiresAt` | Unix time in milliseconds. `0` means the token never expires. |

---

## List

`GET /api/v1/flags` returns every flag in the token's project.

```bash
curl https://api.rocketflag.app/api/v1/flags \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

Add `?name=` to filter to flags whose name matches exactly. This is how a script finds a flag's id from its name:

```bash
curl "https://api.rocketflag.app/api/v1/flags?name=new-checkout" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

```json
{
  "flags": [
    {
      "id": "Zt4nQ8wK2mVx7LpB3hYc",
      "name": "new-checkout",
      "kind": "flag",
      "enabled": true,
      "trafficPercentage": 50,
      "cohorts": ["beta-testers"],
      "audienceId": null,
      "updatedAt": 1790726400000
    }
  ]
}
```

The list is always an object with a `flags` array, and the array is `[]` when nothing matches, never `null`. An environment-restricted token still lists every flag: the restriction applies to writes and to reads that name an environment.

### The flag representation

Every endpoint that returns a flag uses the same shape. `id`, `name`, `kind` and `updatedAt` are always present. `kind` is `flag` for a single-environment project and `groupflag` for a multi-environment one. Then the state comes in one of two forms.

**Flat.** A single flag, or a group flag fetched with `?env=`, carries its state at the top level:

| Field | Type | Notes |
| :--- | :--- | :--- |
| `enabled` | boolean | The master switch. |
| `trafficPercentage` | integer | 0 to 100. |
| `cohorts` | array of strings | Always an array. `[]` when there are none. |
| `audienceId` | string or `null` | The [audience](/guides/audiences/) applied to the flag, or `null` for everyone. |
| `environment` | string | Only on a group flag fetched with `?env=`: the environment you asked for. |

**With `environments`.** A group flag fetched without `?env=` carries one entry per environment and no flat state:

```json
{
  "id": "Gp9rS5dH1jXe6UaM0fTw",
  "name": "new-checkout",
  "kind": "groupflag",
  "environments": {
    "production": {
      "enabled": false,
      "trafficPercentage": 0,
      "cohorts": [],
      "audienceId": null,
      "updatedAt": 1790730000000
    },
    "staging": {
      "enabled": true,
      "trafficPercentage": 100,
      "cohorts": ["qa-team"],
      "audienceId": "k3j9x2m7q1pz",
      "updatedAt": 1790730000000
    }
  },
  "updatedAt": 1790730000000
}
```

`environments` is always present on this shape, as `{}` for a project that has no environments yet. Each environment's `updatedAt` is currently the flag's own `updatedAt`, so do not rely on it to tell you when one environment changed. For a group flag, the `cohorts` you read for an environment is the effective list: the environment's own override if it has one, otherwise the flag-wide list.

---

## Get

`GET /api/v1/flags/{id}` returns one flag.

```bash
curl https://api.rocketflag.app/api/v1/flags/Gp9rS5dH1jXe6UaM0fTw \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

For a group flag, add `?env=` to get one environment as a flat flag:

```bash
curl "https://api.rocketflag.app/api/v1/flags/Gp9rS5dH1jXe6UaM0fTw?env=staging" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN"
```

```json
{
  "id": "Gp9rS5dH1jXe6UaM0fTw",
  "name": "new-checkout",
  "kind": "groupflag",
  "environment": "staging",
  "enabled": true,
  "trafficPercentage": 100,
  "cohorts": ["qa-team"],
  "audienceId": "k3j9x2m7q1pz",
  "updatedAt": 1790730000000
}
```

Passing `?env=` on a single-environment project is a `400` that tells you to drop the parameter. An unknown environment is a `400` that lists the valid ones. A flag id that does not exist, or that belongs to another project, is a `404`, and the two cases look identical on purpose.

---

## Create

`POST /api/v1/flags` creates a flag. It needs a `write` token. The body depends on the project type.

**Single-environment project.** Put the state at the top level. Only `name` is required:

```bash
curl -X POST https://api.rocketflag.app/api/v1/flags \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new-checkout",
    "description": "Redesigned checkout flow",
    "tags": ["checkout"],
    "enabled": false,
    "trafficPercentage": 0,
    "cohorts": ["beta-testers"]
  }'
```

**Multi-environment project.** Put the state inside `environments`, keyed by environment name. Any environment you leave out starts disabled at 0% with no cohorts, and `{}` is a valid value for an environment that should take those defaults:

```bash
curl -X POST https://api.rocketflag.app/api/v1/flags \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new-checkout",
    "environments": {
      "staging": { "enabled": true, "trafficPercentage": 100 },
      "production": {}
    }
  }'
```

A successful create returns `201` and the new flag in the [standard representation](#the-flag-representation). Sending flat state to a multi-environment project, or `environments` to a single-environment one, is a `400` that names the fix. Problems in the body are all reported together, each naming its path, for example `environments.staging.trafficPercentage must be a whole number between 0 and 100`.

`audienceId` is optional. Absent or `null` means no audience. An id that is not one of the project's audiences is a `400`.

The API has no endpoint that lists audiences. To find an audience's id, open the **Audiences** tab in the console or edit the audience, where each audience displays its id with a copy button.

:::note
A token restricted to some environments can still create flags, but a body that sets state for an environment outside its list is refused with `403`.
:::

---

## Patch

`PATCH /api/v1/flags/{id}` changes a flag's state. It needs a `write` token. For a group flag you must say which environment with `?env=`.

```bash
curl -X PATCH "https://api.rocketflag.app/api/v1/flags/Zt4nQ8wK2mVx7LpB3hYc" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

```json
{
  "changed": true,
  "flag": {
    "id": "Zt4nQ8wK2mVx7LpB3hYc",
    "name": "new-checkout",
    "kind": "flag",
    "enabled": true,
    "trafficPercentage": 50,
    "cohorts": ["beta-testers"],
    "audienceId": null,
    "updatedAt": 1790733600000
  }
}
```

### Merge patch rules

The body is a merge patch. The rules are the same for every key:

- A key that is present **replaces** the stored value.
- A key that is absent is **left alone**.
- The accepted keys are `enabled`, `trafficPercentage` (a whole number from 0 to 100), `cohorts` (an array of strings) and `audienceId`.
- `null` is rejected for every key except `audienceId`.
- Unknown keys are rejected by name.

`cohorts` replaces the whole list, it does not append. Send `[]` to clear it:

```bash
curl -X PATCH "https://api.rocketflag.app/api/v1/flags/Zt4nQ8wK2mVx7LpB3hYc" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cohorts": []}'
```

`audienceId` takes an audience id to attach it, and `null` to detach it so the flag applies to everyone again. See [Create](#create) for how to find an audience's id:

```bash
curl -X PATCH "https://api.rocketflag.app/api/v1/flags/Zt4nQ8wK2mVx7LpB3hYc" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"audienceId": null}'
```

On a group flag, `audienceId` is per environment, so the patch applies to the environment named in `?env=`. Also on a group flag, `cohorts` sets that environment's own override. Sending `cohorts: []` removes the override, and the environment goes back to inheriting the flag-wide list, so the response shows that inherited list.

A few consequences of how group flag cohorts work:

- The flag-wide cohort list cannot be set or read as such through the API. Create and patch only write per-environment overrides, and reads show the effective list.
- With no override set, sending cohorts equal to the inherited list changes nothing and does not create an override.
- While the flag-wide list is not empty, there is no way to say "this environment has no cohorts". An empty list always means "inherit".

### Changes that change nothing

If the patch leaves the flag exactly as it is, the response is `200` with `"changed": false` and the current flag. Nothing is written: no `updatedAt` bump, no audit entry. That makes a patch safe to repeat, so a pipeline can set the desired state on every run without noisy history.

### Validation errors

Every problem in a body is reported at once, joined with `; `. An unknown key:

```bash
curl -X PATCH "https://api.rocketflag.app/api/v1/flags/Zt4nQ8wK2mVx7LpB3hYc" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rollout": 25}'
```

```json
{
  "error": "Invalid request",
  "detail": "unknown field \"rollout\"",
  "docs": "https://docs.rocketflag.app/api/management#patch"
}
```

A `null` where it is not allowed, and an out of range percentage, in one response:

```json
{
  "error": "Invalid request",
  "detail": "\"enabled\" cannot be null; \"trafficPercentage\" must be a whole number between 0 and 100",
  "docs": "https://docs.rocketflag.app/api/management#patch"
}
```

A `PATCH` with an empty body, or a body with no keys such as `{}`, is refused so a typo cannot pass as a successful no-op:

```json
{
  "error": "Invalid request",
  "detail": "no fields to update; send at least one of enabled, trafficPercentage, cohorts, audienceId",
  "docs": "https://docs.rocketflag.app/api/management#patch"
}
```

The "request body is empty; send a JSON object" detail applies only to `POST /api/v1/flags`, where a body is always required.

An `audienceId` that does not exist on the project is a `400` with the detail `Audience "a1b2c3d4e5f6" does not exist on this project`.

---

## Errors

Every error from `/api/v1` has the same body:

| Field | Meaning |
| :--- | :--- |
| `error` | A short title. Stable enough to branch on. |
| `detail` | What went wrong and, where possible, how to fix it. Written for people, so log it rather than parse it. |
| `docs` | A link to the section of this page that explains the failure. |

```json
{
  "error": "Not found",
  "detail": "No flag with that id in this project",
  "docs": "https://docs.rocketflag.app/api/management#get"
}
```

| Status | When | Where to look |
| :--- | :--- | :--- |
| `400` | The body or query failed validation (every problem is listed), a patch is empty or has an unknown or null key, or the request does not fit the project type (missing or unneeded `env`, unknown environment). | [Patch](#patch), [Create](#create) |
| `401` | Missing, malformed, unknown, revoked or expired token. | [Auth](#auth) |
| `402` | The organisation is not on the Teams or Enterprise plan (or an active Teams trial), or its subscription has lapsed. Reads and writes alike return this until it is back in good standing. | [Auth](#auth) |
| `403` | A `read` token on a write route, or an environment outside the token's list. The detail names the environment or the permission. | [Security](#security) |
| `404` | No such flag, or it belongs to another project. Also any path under `/api/v1` that does not exist. | [Get](#get) |
| `413` | The request body is larger than 1 MiB. | [Create](#create), [Patch](#patch) |
| `429` | Too many requests, or too many failed authentication attempts. | [Rate limits](#rate-limits) |
| `500` | Something unexpected on our side. Retry, and contact support if it persists. | [Errors](#errors) |

A `403` for an environment looks like this:

```json
{
  "error": "Environment not permitted",
  "detail": "This token cannot use the \"production\" environment. It is limited to: staging",
  "docs": "https://docs.rocketflag.app/api/management#security"
}
```

And for a read-only token trying to write:

```json
{
  "error": "Insufficient permission",
  "detail": "This token has read permission. This endpoint needs a token with write permission",
  "docs": "https://docs.rocketflag.app/api/management#security"
}
```

---

## Rate limits

There are two limits, and a healthy script will not notice either.

- **600 requests per minute per IP address**, applied before the request reaches the API. A CI fleet behind one NAT shares this budget. A request over the limit gets a plain `429` with no JSON envelope, because it is refused at the edge.
- **20 failed authentication attempts per minute per IP address**, for requests that send no token, a malformed token or a token that does not exist. After that the API answers `429` with the envelope and the detail `Wait a minute before retrying`. A valid token that is merely misconfigured (wrong permission, revoked, wrong environment) does not count towards this, so a bad pipeline cannot lock itself out. While an IP address is limited, every request from it gets `429`, including requests with a valid token. The window is a fixed 60 seconds from the first failure, counted separately on each server instance.

On a `429`, wait a minute and retry. Do not loop faster.

---

## Security

A `403` means the token is real but may not do what you asked. The usual causes are a `read` token on a write route, an `?env=` outside the token's environment list, and a create body that sets state for an environment the token may not change, for example the detail `This token cannot change the "production" environment` with the title `Forbidden`.

- **The secret is shown once.** RocketFlag stores only a hash of a token. Copy the `rf_...` value when you create it and put it straight into your CI secret store. If you lose it, create a new token.
- **Keep it out of URLs.** Always send the token in the `Authorization` header. A secret in a query string ends up in logs, proxies and shell history.
- **Use the least access that works.** A `read` token is enough for anything that only checks state. A pipeline that only touches staging should have a token limited to `staging`.
- **Rotate and revoke from the console.** Rotating creates a replacement with the same name, permission, environments and expiry, and revokes the original. Revoked tokens stop working within about a minute.
- **Denials are reported.** When a real token is refused (revoked, expired, wrong permission, or an environment it may not use), the attempt is recorded on the token's page in the console, and the token's creator and the organisation's owners get an email, at most once per token per 24 hours. A sudden denial usually means a pipeline was edited or a secret leaked, so it is worth a look.
- **Every change is audited.** Writes made with a token appear in the audit log as `token:<id>`, with the token's name.
- **Do not call it from a browser.** The Management API can change production flags. Keep tokens in server-side code and CI secrets, never in a frontend bundle. For client-side flag checks, use the [Evaluation API](/dev/api-reference/), which needs no secret.

### CORS

The API answers cross-origin requests from any origin (`Access-Control-Allow-Origin: *`, without credentials). It allows `GET`, `POST`, `PATCH` and `OPTIONS`, and the `Content-Type` and `Authorization` request headers. A preflight `OPTIONS` request is answered without a token. That means a browser can technically call the API, which can be handy for an internal tool. It also means any page that holds a token exposes it to everyone who can open that page, so only do this where you fully trust every viewer.
