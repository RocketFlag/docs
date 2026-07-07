---
title: Group (Multi-Env) Flags
description: Managing flags across multiple environments.
---

**Group Flags** (available in Multi-Environment projects) allow you to manage a single feature flag across multiple environments like Development, Staging, and Production from a single interface.

### Creating a Group Flag

1. Enter a **Multi-Environment Project**.
2. Click **New Group Flag**.
3. Provide a **Name** and **Description**.
4. Configure the default settings for each of your defined environments.
5. Click **Create**.

### Environment Isolation

The core benefit of Group Flags is environment isolation. Each environment you've added to the flag can be managed independently.

#### Per-Environment Toggles
In the Group Flags table, you will see a toggle for each environment. Toggling "on" for `dev` will not affect the `prod` state.

#### Per-Environment Traffic
You can set different rollout percentages for different environments. For example:
- `dev`: 100%
- `staging`: 50%
- `prod`: 0% (disabled)

#### Per-Environment Cohorts (Overrides)
You can define specific cohorts for an environment. 
- **Override:** If you set a cohort for the `dev` environment, the system will use that list and **ignore** the global flag-level cohorts for requests targeting `dev`.
- **Fallback:** If an environment has no specific cohorts defined, it will fall back to using the global cohorts defined on the Group Flag.
- **Configuration:** These can be added or updated by clicking the **Update** icon for a specific environment in the Group Flags table.


### Targeting Environments via API

When querying a Group Flag, you **must** specify the environment using the `env` parameter:

```bash
GET https://api.rocketflag.app/v1/flags/{flag_id}?env=production
```

If the `env` parameter is missing or does not match an environment defined for that flag, the API will return a `404 Not Found`.

### Caretaker Integration

Group flags are fully integrated with RocketFlag's **Caretaker** on the Teams tier and above. If a group flag is fully rolled out across all environments and left unchanged (or gets no traffic), the Caretaker will mark it as stale or dormant.

When removing a group flag, the Caretaker tab can generate an environment-aware **removal prompt** for your AI coding agent, detailing the active state of each environment. See [Managing Stale Flags](/guides/stale-flags/) for details.
