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

This reference covers the **public Evaluation API** used by your applications to read flag state. It requires no account credentials — flags are addressed by their **Flag ID**, and can optionally be secured with a [**Protected Key**](/dev/protected-keys/). It is safe to call from frontend, backend, and client-side code.

> The **Management API** (creating, updating, and deleting flags, projects, organisations, etc.) is private, requires full user authentication, and is used by the RocketFlag console. It is not part of this public reference.

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
| `cohort` | string | No | A unique identifier (e.g., email, user ID) to check against the flag's cohort list. |
| `env` | string | **Yes\*** | The environment label (e.g., `production`). **Required for Group Flags.** |
| `key` | string | No | The Protected Key for the flag. Required if the flag has a protected key enabled. |

#### Headers
| Header | Required | Description |
| :--- | :--- | :--- |
| `x-rocketflag-key` | No | Alternative way to provide the Protected Key. |

#### Sample Request
```bash
curl "https://api.rocketflag.app/v1/flags/ABC123def456?cohort=user@example.com&env=production"
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
- **404 Not Found:** Returned if the `flag_id` does not exist, if the `env` parameter is missing/incorrect for a Group Flag, or if a valid Protected Key was not provided for a protected flag. A `404` is deliberately returned for protected flags so their existence can't be probed.
- **500 Internal Server Error:** Returned if an unexpected error occurs on the server.

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
