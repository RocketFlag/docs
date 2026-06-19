---
title: React SDK
description: Using the RocketFlag SDK in your React applications.
---

The RocketFlag React SDK wraps the RocketFlag API in idiomatic React primitives — a provider, a hook, and a declarative component — so you get loading/error state and re-renders on resolution without hand-rolling effects.

It is built on browser-native `fetch` with **zero runtime dependencies** (React is a peer dependency).

### Installation

```bash
npm install @rocketflag/react-sdk
```

Requires **React 16.14 or newer**.

### Basic Usage

#### 1. Wrap your app in the provider

Add `RocketFlagProvider` once, near the root of your app. It builds a single shared client (and shared cache) for every flag check below it.

```tsx
import { RocketFlagProvider } from "@rocketflag/react-sdk";

function Root() {
  return (
    <RocketFlagProvider cacheTtlSeconds={300}>
      <App />
    </RocketFlagProvider>
  );
}
```

Provider props (all optional):

| Prop              | Description                                                                      |
| :---------------- | :------------------------------------------------------------------------------- |
| `version`         | API version segment (defaults to `v1`).                                          |
| `apiUrl`          | Base API URL (defaults to `https://api.rocketflag.app`).                         |
| `cacheTtlSeconds` | Default cache TTL in seconds, shared across all hooks. Omit to disable caching.  |
| `client`          | Inject a pre-built client (testing / advanced use).                             |

#### 2. Read a flag with the `useFlag` hook

```tsx
import { useFlag } from "@rocketflag/react-sdk";

function SignUpButton() {
  const { enabled, loading, error } = useFlag("IFldMzqP5jtv9wAL");

  if (loading) return <Spinner />;
  if (error) return null;
  return enabled ? <NewSignUp /> : <OldSignUp />;
}
```

`useFlag` returns:

| Field     | Type                 | Description                              |
| :-------- | :------------------- | :--------------------------------------- |
| `enabled` | `boolean`            | `flag?.enabled ?? false`.                |
| `flag`    | `FlagStatus \| null` | The full flag, or `null` until resolved. |
| `loading` | `boolean`            | `true` until the first fetch settles.    |
| `error`   | `Error \| null`      | The thrown error, if any.                |
| `refetch` | `() => void`         | Re-run the fetch on demand.              |

> `useFlag` must be called inside a `<RocketFlagProvider>`. Used outside one, it throws `useFlag must be used within a <RocketFlagProvider>`.

Use `refetch` to re-evaluate on demand — for example after a user action that may change targeting:

```tsx
const { enabled, refetch } = useFlag("IFldMzqP5jtv9wAL");

return <button onClick={refetch}>Re-check feature</button>;
```

#### 3. Or render declaratively with `<Flag>`

```tsx
import { Flag } from "@rocketflag/react-sdk";

<Flag id="IFldMzqP5jtv9wAL" fallback={<OldBanner />} loading={<Spinner />}>
  <NewBanner />
</Flag>;
```

`children` render when the flag is enabled; `fallback` when it's disabled or the fetch errors; `loading` while it's pending. Both `fallback` and `loading` default to rendering nothing.

### Advanced Usage

#### Cohorts and environments

Pass a user context as the second argument. The cache keys on flag ID **and** context, so different cohorts/environments resolve independently.

```tsx
const { enabled } = useFlag("IFldMzqP5jtv9wAL", { cohort: "beta", env: "staging" });
```

- `cohort`: `string | number | boolean` — cohort/variant identifier.
- `env`: `string` — must be **alphanumeric**. Required for [Group Flags](/guides/group-flags/).

> **Input validation:** the client validates its arguments and throws synchronously for bad input — `flagId` must be a non-empty string, context values must be `string`/`number`/`boolean`, and `env` must be alphanumeric. These surface via the hook's `error` field.

#### Per-call cache override

Pass cache options as the third argument to override the provider default for a single call (or `0` to force a fresh fetch):

```tsx
const { flag } = useFlag("IFldMzqP5jtv9wAL", {}, { ttlSeconds: 0 });
```

#### Imperative use

Need a client outside of React (e.g. in an event handler or loader)? Build one directly:

```ts
import { createRocketflagClient } from "@rocketflag/react-sdk";

const client = createRocketflagClient(); // (version?, apiUrl?, { ttlSeconds }?)
const flag = await client.getFlag("IFldMzqP5jtv9wAL");
```

### Error Handling

The underlying client throws the same three error types as the [Node SDK](/dev/node-sdk/):

- `APIError` — the API returned a non-ok response (carries `status` and `statusText`).
- `InvalidResponseError` — the response wasn't valid JSON or didn't match the expected shape.
- `NetworkError` — a network failure, such as a dropped connection.

These surface via the `error` field on `useFlag`. You can narrow them:

```tsx
import { APIError, InvalidResponseError, NetworkError } from "@rocketflag/react-sdk";

const { error } = useFlag("IFldMzqP5jtv9wAL");
if (error instanceof APIError) {
  // error.status, error.statusText
}
```

### Testing

Inject a pre-built (or mock) client via the provider's `client` prop. When set, `version`, `apiUrl`, and `cacheTtlSeconds` are ignored, so your components resolve flags without hitting the network:

```tsx
const mockClient = {
  getFlag: async () => ({ id: "test", name: "Test Flag", enabled: true }),
};

render(
  <RocketFlagProvider client={mockClient}>
    <SignUpButton />
  </RocketFlagProvider>,
);
```

### Server-Side Rendering (Next.js, Remix)

Flag fetching runs client-side inside `useEffect`, so **no request is made during SSR** — the server render produces the `loading` state, and the real value resolves after hydration. This keeps the SDK safe to drop into server-rendered apps without leaking requests onto the server.

### Caching notes & limitations

- Caching is **opt-in** — without `cacheTtlSeconds` (or a per-call `ttlSeconds`), every check hits the API.
- The cache has no size cap and entries are only evicted when re-requested after expiry. With high-cardinality contexts (e.g. per-user IDs), remount the provider periodically to release memory.
- **No in-flight de-duplication:** two components requesting the same uncached flag in the same tick may each fire a request before the cache populates.
- The API is one-flag-per-request, so this SDK offers `useFlag(id)` rather than a bulk `useFlags()`.

### Types & Exports

The package is written in TypeScript and ships its own declarations. Everything you can import:

```ts
import {
  RocketFlagProvider,   // provider component
  useFlag,              // hook
  Flag,                 // declarative component
  createRocketflagClient, // imperative client factory
  APIError,             // error classes
  NetworkError,
  InvalidResponseError,
} from "@rocketflag/react-sdk";

import type {
  RocketFlagProviderProps,
  UseFlagResult,
  FlagProps,
  FlagStatus,
  UserContext,
  CacheOptions,
  CallOptions,
  RocketFlagClient,
} from "@rocketflag/react-sdk";
```

The resolved flag shape (`FlagStatus`) matches the [API response](/dev/api-reference/#evaluate-a-flag):

```ts
type FlagStatus = {
  id: string;
  name: string;
  enabled: boolean;
};
```
