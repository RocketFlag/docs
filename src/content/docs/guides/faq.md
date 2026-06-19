---
title: FAQ & Troubleshooting
description: Answers to common questions and fixes for common issues.
---

### My flag returns `404 Not Found`. Why?

A `404` from the evaluation API means one of:

- The **Flag ID is wrong** — copy it again from the flags table in the [console](https://console.rocketflag.app).
- The flag is a **Group (Multi-Environment) Flag** and you didn't pass `env`, or the `env` value doesn't match a defined environment label. The `env` parameter is **case-sensitive**. See [Group Flags](/guides/group-flags/).
- The flag has a **Protected Key** and you didn't supply it (or supplied the wrong one). Protected flags deliberately return `404` so their existence can't be probed. See [Protected Keys](/dev/protected-keys/).

### I renamed an environment and now I get `404`.

Environment labels are matched exactly. If you rename a label in the console, update the `env` parameter in your application code to match. See [Environment Management](/guides/environment-management/#important-renaming-environments).

### My cohort request returns `400 Bad Request`.

The `cohort` value contained characters that weren't URL-encoded (a common culprit is `+`). Always URL-encode cohort values before sending them. The SDKs handle this for you. See the [API Reference](/dev/api-reference/).

### The same user sometimes sees the feature and sometimes doesn't.

Traffic-percentage rollouts are evaluated **randomly per request**, so a user below 100% traffic won't get a consistent result across requests. For a stable per-user experience, target them with a [**Cohort**](/guides/feature-flags/#targeting-with-cohorts) instead of (or in addition to) a traffic percentage.

### My analytics numbers look behind.

Analytics are processed in batches. Usage counts update frequently, but there can be a delay of up to **10–15 minutes** before the latest hits appear in the charts. Analytics require the **Teams** tier or above. See [Analytics & Stats](/guides/analytics-and-stats/).

### Is the Protected Key the same as my account credentials?

No. A **Protected Key** only grants read access to a single flag's evaluation state and is safe to use in application code. It is unrelated to your account login, which authenticates the private management API used by the console. See [Security & Privacy](/guides/security-and-privacy/).

### Can I cache flag responses?

Yes. The [Node](/dev/node-sdk/#caching-responses) and [React](/dev/react-sdk/#caching-notes--limitations) SDKs support opt-in in-memory caching with a configurable TTL, keyed by flag ID and user context. Caching is off by default.

### I don't see the Caretaker tab / analytics / audit logs.

These are tier-gated:

- **Caretaker** (stale-flag detection) and **Analytics** require the **Teams** tier or above, on a project that belongs to an Organisation.
- **Organisation-wide Audit Logs** require the **Ultra** tier.

See [Organisation Tiers](/guides/organisations-and-users/#organisation-tiers).

### Which SDK should I use?

- **React apps:** the [React SDK](/dev/react-sdk/) (provider + `useFlag` hook + `<Flag>` component).
- **Node.js / other JavaScript:** the [Node SDK](/dev/node-sdk/).
- **Go services:** the [Go SDK](/dev/go-sdk/).
- **Anything else:** call the [API](/dev/api-reference/) directly — it's a single `GET` request.

### My question isn't here.

Reach out through the [RocketFlag](https://rocketflag.app) website — we'd love to help.
