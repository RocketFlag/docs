---
title: Concepts
description: Key terms and architectural concepts in RocketFlag.
---

Understanding these core concepts will help you get the most out of RocketFlag.

### Personal Projects vs Organisations

You don't need to set anything up to start — you can create a **personal project** (owned by just you) the moment you sign in. The free tier includes up to **3 personal projects**, which is ideal for trying RocketFlag, side projects, or solo work.

An **Organisation** is a shared workspace for working with a team. It's the top-level container for projects and people, and serves as your billing entity.
- **Roles:** Organisations support **Admins** (full control) and **Members** (can manage flags but not organisation settings).
- **Tiers:** Options include Free, Teams, and Ultra, offering different levels of features and limits.
- **Team features:** Inviting members, project sharing, the stale-flag [Caretaker](../../guides/stale-flags), analytics, and organisation-wide audit logs require an Organisation (on the relevant tier).

A personal project can be [moved into an Organisation](../../guides/projects-and-environments#moving-a-project-into-an-organisation) at any time — your flag IDs stay the same, so nothing breaks in your code.

### Projects

A **Project** is a logical grouping of related feature flags. A project is either **personal** (owned by you) or owned by an **Organisation**. Projects come in two types:
1. **Single Environment:** A simple container for flags, often tied to a specific environment like "Production".
2. **Multi-Environment (Group Flags):** A more advanced project type that allows you to manage the same flag across multiple environments (e.g., Dev, Staging, Prod) within a single view.

### Feature Flags

A **Flag** is the core entity of the service. It represents a feature or a conditional path in your application.
- **Enabled:** A global toggle to turn the feature on or off.
- **Traffic Percentage:** Control the rollout by enabling the flag for a specific percentage of requests (0-100%).
- **Cohorts:** Target specific users or groups by providing a list of identifiers (emails, IDs, etc.).
- **Protected Keys:** Add an extra layer of security requiring a key to be sent with the API request.

### Group Flags (Multi-Env)

**Group Flags** are flags that exist across multiple environments. Each environment can have its own:
- Enabled status
- Traffic percentage
- Environment-specific cohorts (which override global cohorts)

### Cohorts

**Cohorts** are lists of identifiers used for targeting. When you query a flag, you can provide a `cohort` parameter. If that value exists in the flag's cohort list, the flag will evaluate to `true` (if enabled).

### Audit Logs

Every change to a flag's state (creation, update, toggle, deletion) is recorded in the **Audit Logs**, providing a history of who changed what and when.

### Caretaker (Stale & Dormant Flags)

The **Caretaker** automatically classifies each flag to help you find ones that are ready to retire:

- **Stale:** Fully rolled out and unchanged for more than **30 days** while still receiving high traffic.
- **Dormant:** Has received **no evaluations for 60+ days**.

Flagged flags get a **Caretaker** badge, and RocketFlag can generate a removal prompt for your AI coding agent to clean them out of your codebase. Caretaker is available on the **Teams** tier and above. See [Managing Stale Flags](../../guides/stale-flags) for the full workflow.

