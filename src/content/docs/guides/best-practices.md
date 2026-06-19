---
title: Best Practices & Workflow
description: Effective patterns for feature flagging and technical debt management.
---

Adopting feature flags is more than just a technical change; it's a workflow change. Follow these best practices to keep your RocketFlag implementation clean and effective.

### 1. Naming Conventions
Consistency is key to finding flags as your project grows. Use clear, descriptive names:

- **Good:** `enable-stripe-billing`, `v2-dashboard-rollout`, `maintenance-mode-banner`
- **Bad:** `test-flag`, `new-feature-1`, `jk-test`

**Pro Tip:** Use **Tags** to categorise flags by team (`team:payments`), owner (`owner:sarah`), or release cycle (`release:q3`).

### 2. Flag Lifecycle & "Stale" Flags
Feature flags are intended to be temporary. Once a feature is 100% rolled out and verified, the flag should be removed from the code.

- **Caretaker:** On the Teams tier and above, RocketFlag's **Caretaker** automatically marks flags as **Stale** (fully rolled out and unchanged for 30+ days) or **Dormant** (no evaluations for 60+ days), with a badge in the flags table. It can even generate a removal prompt for your AI coding agent. See [Managing Stale Flags](/guides/stale-flags/).
- **The Workflow:** Once a week, scan for **Caretaker** badges to find flags ready for retirement. Removing these flags reduces "conditional branches" in your code, simplifies your logic, and improves long-term maintainability.

### 3. Progressive Rollouts
Don't just toggle a feature from 0% to 100%. Use the **Traffic Percentage** to mitigate risk:

1. **0%:** Feature is in the code but disabled for everyone.
2. **Cohorts (Internal):** Enable the flag for your internal team's emails or IDs.
3. **10% Traffic:** Release to a small subset of real users to monitor performance.
4. **50% -> 100%:** Scale up as confidence grows.

### 4. Group Flags vs. Single Flags
- Use **Group Flags** for long-lived features that need to be tested in staging before production.
- Use **Single Flags** for quick experiments or simple applications that don't have multiple environment stages.

### 5. Decouple Deployment from Release
The ultimate goal of RocketFlag is to allow you to **deploy code anytime**. By wrapping new features in flags, you can merge code to `main` and deploy it to production while it is still "disabled" via RocketFlag. This eliminates the need for long-lived "feature branches" and makes "Continuous Integration" much easier.
