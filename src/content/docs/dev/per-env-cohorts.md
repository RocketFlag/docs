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

1. Open a **Group Flag** in a Multi-Environment project.
2. Find the environment you want to override (e.g., `dev`) in the environments table.
3. Click the **Edit** (pencil) icon for that environment.
4. Enter your comma-separated list of identifiers in the **Environment Cohorts** field.
5. Click **Save**.

### Identifying Overrides in the UI

To help you quickly identify which environments are using overrides, a **"Cohorts" badge** will appear next to the environment name in the Group Flags table whenever a specific cohort list is active for that environment.

### API Integration

There are no changes required to your API or SDK calls. Simply continue sending the `env` and `cohort` parameters as usual. The RocketFlag backend handles the override/fallback logic automatically.
