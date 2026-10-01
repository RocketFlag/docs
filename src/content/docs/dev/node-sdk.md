---
title: Node.js SDK
description: Using the RocketFlag SDK in your Node.js or JavaScript applications.
---

The RocketFlag Node.js SDK provides a convenient wrapper around the RocketFlag API, handling authentication, caching, and environment configuration for you.

### Installation

Install the SDK via npm or yarn:

```bash
npm install @rocketflag/node-sdk
```

### Basic Usage

Import and initialize the client:

```javascript
import createRocketflagClient from "@rocketflag/node-sdk";

// Initialize the client
const rocketflag = createRocketflagClient();

async function checkFeature() {
  const flagId = "ABC123def456";
  
  try {
    const flag = await rocketflag.getFlag(flagId);
    
    if (flag.enabled) {
      console.log(`Feature "${flag.name}" is enabled!`);
    }
  } catch (error) {
    console.error("Error fetching flag:", error.message);
  }
}
```

### Advanced Usage

#### Working with Cohorts
Pass a cohort identifier to target specific users:

```javascript
const flag = await rocketflag.getFlag(flagId, {
  cohort: "user@example.com"
});
```

#### Attributes and sticky rollouts
Add a `targetingKey` for sticky percentage rollouts, and any other keys as audience attributes:

```javascript
const flag = await rocketflag.getFlag(flagId, {
  targetingKey: "user-42",
  plan: "pro",
  country: "AU"
});
```

Percentage rollouts are sticky per key: the same `targetingKey` (or, without one, the same `cohort`) gets the same answer every time, so send a stable user identifier. Other keys are matched against the flag's [audience](/guides/audiences/) and are only read when the flag has one. Matching is exact and case-sensitive, and an attribute you do not send never matches. `cohort`, `env` and `targetingKey` are reserved and cannot be audience attributes. The SDK sends every key in the context to the API, so this needs no new method. In TypeScript, the `UserContext` type currently declares only `cohort` and `env`, so an object literal with other keys fails type-checking until the next SDK release widens the type. Until then, cast the object (`{ plan: "pro" } as UserContext`). Building it as a variable does not help on its own, because TypeScript still rejects an object that shares no property with `UserContext` unless it also carries `cohort` or `env`. See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts).

#### Working with Group Flags (Environments)
When using Group Flags, you must specify the environment:

```javascript
const flag = await rocketflag.getFlag(flagId, {
  env: "production"
});
```

### Custom Configuration

You can customize the API URL or version if necessary:

```javascript
const apiVersion = "v1";
const apiUrl = "https://your-custom-proxy.com";
const rocketflag = createRocketflagClient(apiVersion, apiUrl);
```

### Caching Responses

To avoid hitting the API on every check, enable an in-memory cache by passing a default `ttlSeconds` (the third argument) when creating the client. Cached entries are keyed by flag ID **and** the user context, so different cohorts or environments still resolve independently.

```javascript
// Cache flag responses for 5 minutes.
const rocketflag = createRocketflagClient(undefined, undefined, { ttlSeconds: 300 });

// First call hits the API; subsequent calls within 5 minutes are served from cache.
const flag = await rocketflag.getFlag("ABC123def456", { cohort: "beta" });
```

Override the TTL for a single call, or disable caching for that call by passing `0`:

```javascript
// Force a fresh fetch, bypassing the cache.
const flag = await rocketflag.getFlag("ABC123def456", {}, { ttlSeconds: 0 });

// Use a shorter TTL just for this call.
const flag = await rocketflag.getFlag("ABC123def456", {}, { ttlSeconds: 10 });
```

Caching is **opt-in** — without a client default or per-call TTL, every call goes to the API. The cache has no size cap and entries are only evicted when their key is re-requested after expiry; if you call with high-cardinality user contexts (e.g. per-user IDs), construct a new client periodically to release memory.

### Error Handling

The SDK can throw three typed errors:

- `APIError` — the API returned a non-ok response. Carries the `status` and `statusText`.
- `InvalidResponseError` — the response wasn't valid JSON or didn't match the expected shape.
- `NetworkError` — a network failure, such as a dropped connection.

```javascript
import { APIError, InvalidResponseError, NetworkError } from "@rocketflag/node-sdk/errors";

try {
  const flag = await rocketflag.getFlag("ABC123def456");
  // ...
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error: ${error.status} ${error.statusText}`);
  } else if (error instanceof InvalidResponseError) {
    console.error(`Invalid Response Error: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error(`Network Error: ${error.message}`);
  } else {
    console.error("An unknown error occurred", error);
  }
}
```
