---
title: Per-Environment Cohorts
description: Overriding cohorts for specific environments in Group Flags.
---

**Per-Environment Cohorts** provide granular control over user targeting when using Group Flags (Multi-Environment projects).

### The Problem

Previously, cohort settings for a Group Flag were global. If you added test users to a flag, those same IDs were used across Development, Staging, and Production. This became an issue if:
- Different environments used different user ID formats (e.g., auto-increment IDs in Dev vs. UUIDs in Prod).
- You wanted to enable a feature for a specific group of internal testers in Staging without affecting your Production beta testers.

### The Solution: Environment Overrides

You can now define distinct cohorts for *every single environment* your flag is deployed to.

#### How it Works: Override vs. Fallback
1. **Override:** If you define a cohort list for a specific environment (e.g., `staging`), RocketFlag will strictly use that list for requests targeting that environment and **ignore** the global cohorts.
2. **Fallback:** If you do *not* define an environment-specific cohort list, RocketFlag will automatically fall back to using the global flag-level cohorts. This ensures backward compatibility.

### Setting Up Overrides

You can configure per-environment cohort overrides in two ways:

1. **In the Group Flag editor:** When creating or editing a Group Flag, switch to the desired environment tab (e.g., `dev`) and enter your comma-separated list of identifiers in the **Environment Always on for** field.
2. **From the Group Flags table:** Click the **Edit** (pencil) icon on that specific environment lane (or open the slide-over inspector drawer) to update its targeting individually.

### Identifying Overrides in the UI

To help you quickly identify which environments are using overrides, a **"COHORTS"** (or **"ALWAYS ON"**) badge appears next to the environment name in the Group Flags table and inspector drawer whenever a specific cohort list is active for that environment.

### API Integration

There are no changes required to your API or SDK calls. Simply continue sending the `env` and `cohort` parameters as usual. The RocketFlag backend handles the override/fallback logic automatically.

### Cohorts and audiences together

In the console the cohort list is labelled **Always on for**. A cohort match is always on: if the request's `cohort` is in the environment's effective list, the flag is `true` regardless of the environment's rollout percentage or audience. An environment can also pick its own [audience](/guides/audiences/), so you can give staging a cohort list of testers and an audience for wider testing while production uses a different audience. Requests that do not match the cohort list continue to the audience and then the rollout. If an environment has cohorts but no audience, requests outside the list get `false`.
