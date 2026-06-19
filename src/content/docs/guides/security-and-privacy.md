---
title: Security & Privacy
description: Protecting your flag configuration and user data.
---

Security is a top priority when managing feature flags. RocketFlag provides tools to help you secure your implementation and protect your users' privacy.

### 1. Securing Flags with Protected Keys
By default, RocketFlag IDs are public. While it is difficult to guess a 12-character ID, you should use **Protected Keys** for sensitive features.

- **What it does:** Requires a secret key to be sent with every API request. If the key is missing, the API returns `404 Not Found`.
- **When to use:** For flags that reveal upcoming features, pricing changes, or anything you don't want "spoiled" by a curious user looking at network traffic.

### 2. User Privacy & Cohorts
When using **Cohorts** for targeting, you must provide a `cohort` identifier to the API.

#### Avoid PII
To protect your users' privacy, avoid sending **Personally Identifiable Information (PII)** like raw email addresses or real names to the API if possible.

#### Recommended Pattern: Hashing
Instead of sending `user@example.com`, send a hashed version of the ID or a non-sensitive internal database UUID:

```javascript
// Database ID (Safe)
const cohortId = user.id; // e.g., "507f1f77bcf86cd799439011"

// Evaluated via SDK
const flag = await rocketflag.getFlag(flagId, { cohort: cohortId });
```

### 3. API Security: Evaluation vs. Management
RocketFlag uses two distinct APIs to ensure security:

- **Public Evaluation API:** Used by your applications to check flag states. This is secured via **Flag IDs** and optional **Protected Keys**. It is safe to use in frontend and client-side code.
- **Private Management API:** Used by the RocketFlag dashboard and CLI to create and modify flags. This requires full user authentication and should **never** be called from untrusted client-side environments.

> **Note:** The "Protected Key" used for flag evaluation is different from your account credentials. Protected Keys only grant read access to a specific flag's state and are designed for use in application code.

### 4. Environment Isolation
Use **Multi-Environment Projects** to ensure that changes in your `dev` environment can never accidentally impact your `production` users. Each environment is treated as a separate silo by the RocketFlag evaluation engine.
