---
title: API Reference
description: Technical documentation for the RocketFlag API.
---

The RocketFlag API is designed to be simple and highly performant. The primary endpoint is used to evaluate the state of a feature flag.

### Base URL

```text
https://api.rocketflag.app
```

### Authentication

This reference covers the **public Evaluation API** used by your applications to read flag state. It requires no account credentials — flags are addressed by their **Flag ID**. It is safe to call from frontend, backend, and client-side code.

> The **Management API** (reading and changing flag state from scripts and CI) is a separate, authenticated API that is available with API tokens. It is documented in the [Management API reference](/api/management/). The wider set of console endpoints (projects, organisations and so on) remains private and is not part of any public reference.

---

### Health Check

A lightweight endpoint to verify the API is reachable.

#### Endpoint
`GET /health`

Returns a `200 OK` when the service is healthy.

---

### Evaluate a Flag

Returns the state of a specific feature flag. This endpoint supports both single-environment Flags and Multi-Environment (Group) Flags.

#### Endpoint
`GET /v1/flags/{flag_id}`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cohort` | string | No | A unique identifier (e.g., email, user ID) to check against the flag's cohort list. Letters, digits and `. _ - + @ :` only; URL-encode it (`+` as `%2B`). |
| `env` | string | **Yes\*** | The environment label (e.g., `production`). **Required for Group Flags.** |
| `targetingKey` | string | No | A stable identifier for the end user (a user ID, device ID or email). Makes [percentage rollouts sticky](#sticky-rollouts-and-key-resolution): the same key always gets the same answer. |
| any other key | string | No | An **attribute** such as `plan=pro` or `country=AU`, matched against the flag's [audience](/guides/audiences/). Only read when the flag has an audience. |

`cohort`, `env` and `targetingKey` are **reserved keys**: they always keep their meaning above and cannot be used as audience attribute keys. Attribute matching is exact and case-sensitive, and an attribute you do not send never matches.

#### Sample Request
```bash
curl "https://api.rocketflag.app/v1/flags/ABC123def456?cohort=user@example.com&env=production"
```

With a sticky key and an audience attribute:

```bash
curl "https://api.rocketflag.app/v1/flags/ABC123def456?targetingKey=user-42&plan=pro"
```

#### Success Response (`200 OK`)
```json
{
  "id": "ABC123def456",
  "name": "New Dashboard Feature",
  "enabled": true
}
```

#### Error Responses
- **400 Bad Request:** Returned if the `cohort` query string could not be decoded — usually because it contains special characters (such as `+`) that weren't URL-encoded. The response body explains how to fix it. Always URL-encode cohort values.
- **403 Forbidden:** Returned when access to the flag is not permitted.
- **404 Not Found:** Returned if the `flag_id` does not exist, or if the `env` parameter is missing/incorrect for a Group Flag.
- **500 Internal Server Error:** Returned if an unexpected error occurs on the server.

#### Sticky rollouts and key resolution

The key used to bucket a percentage rollout is the first of these that is present: the `targetingKey` parameter, then the `cohort` parameter. With neither, each request is a fresh random roll. The bucket is computed as:

```text
bucket = FNV1a64(flagId + ":" + key) % 100
enabled = bucket < trafficPercentage
```

FNV-1a 64-bit (offset basis `14695981039346656037`, prime `1099511628211`) over the flag ID, a single `:` byte, then the key. Group flags hash the group flag ID, and the environment is not part of the hash. A percentage of 100 or more is always enabled and 0 or less is always disabled. Test vectors:

| Flag ID | Key | Bucket |
| :--- | :--- | :--- |
| `flag_123` | `user-42` | 10 |
| `flag_123` | `user-43` | 21 |
| `abc` | `alice@example.com` | 92 |

See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts) for the properties this gives you.

#### Evaluation order

1. A disabled flag (or an unknown or disabled environment) returns `false`.
2. If `cohort` is in the flag's cohort list, return `true`. This skips the audience and the percentage.
3. If the flag has an audience and the request does not match it, return `false`.
4. If there is no audience but cohorts are configured, return `false`.
5. Apply the percentage: 100 or more is `true`, otherwise bucket the key, or roll randomly if there is no key.

See [Audiences](/guides/audiences/#how-a-flag-is-evaluated) for detail. Audiences are served by the evaluation service release that carries them; an older release ignores the audience and serves the flag as if none were set.

---

### Get All Flags in a Project

Returns a list of all flags associated with a specific project.

#### Endpoint
`GET /v1/flags/project/{project_id}`

#### Success Response (`200 OK`)
```json
[
  {
    "id": "flag_1",
    "name": "Feature One",
    "enabled": true
  },
  {
    "id": "flag_2",
    "name": "Feature Two",
    "enabled": false
  }
]
```
