---
title: Group (Multi-Env) Flags
description: Managing flags across multiple environments.
---

**Group Flags** (available in Multi-Environment projects) allow you to manage a single feature flag across multiple environments like Development, Staging, and Production from a single interface.

### Creating a Group Flag

1. Enter a **Multi-Environment Project**.
2. Click **New Group Flag**.
3. Provide a **Name**, **Description**, and optional **Tags** to categorize and filter your flags.
4. Configure the settings for each of your defined environments (Enabled state, Audience, per-environment cohort overrides under **Environment Always on for**, and Rollout percentage).
5. Click **Create**.

### Environment Isolation

The core benefit of Group Flags is environment isolation. Each environment you've added to the flag can be managed independently.

#### Environment Scope Bar
Above the Group Flags table, the **Environment Scope Bar** displays `ALL ENVS` alongside pills for each defined environment label with live active counts. You can either view all environments stacked in aligned horizontal lanes or select a specific environment pill (such as `prod` or `staging`) to isolate that environment across all flags in the project.

#### Per-Environment Toggles
In the Group Flags table, each environment lane features its own toggle switch. Toggling "on" for `dev` will not affect the `prod` state. Non-production toggles update immediately, while toggling a flag off in a production environment prompts for confirmation.

#### Per-Environment Traffic
You can set different rollout percentages for different environments. For example:
- `dev`: 100%
- `staging`: 50%
- `prod`: 0% (disabled)

Rollouts are sticky per user. The environment is not part of the bucketing hash, so a user who is in the first 50% in `staging` is also in the first 50% in `prod` once you reach 50% there. See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts). Traffic rollout is shown in the table as a clean chip (`All` at 100%, or the percentage when below 100%).

#### Per-Environment Audiences
Each environment can pick its own [audience](/guides/audiences/). Edit an environment and choose an audience in the **Audience** field. For example, `staging` can use an `internal` audience while `prod` uses `pro-customers`. The **Rollout** percentage then applies to the audience in that environment.

#### Per-Environment Cohorts (Overrides)
You can define specific cohorts for an environment (shown in the console as **Always on for**). A cohort match is always on, whatever the rollout percentage. 
- **Override:** If you set a cohort for the `dev` environment, the system will use that list and **ignore** the global flag-level cohorts for requests targeting `dev`.
- **Fallback:** If an environment has no specific cohorts defined, it will fall back to using the global cohorts defined on the Group Flag.
- **Configuration:** These can be configured directly inside each environment tab when creating or updating a Group Flag, or updated individually by clicking the **Edit** icon for a specific environment lane in the table.

### Inspecting and Editing Flags

Clicking any group flag row opens the slide-over **Flag Inspector Drawer**, organised into two tabs:
- **Targeting & Rollout:** Live per-environment switches, rollout sliders, global cohort chip management, audience summaries, and evaluation precedence order.
- **Telemetry & SDK Snippet:** Real-time evaluation charts, the immutable activity audit log, and ready-to-copy API and SDK integration snippets.

An **Edit Flag** button in the drawer header opens the edit modal directly.


### Targeting Environments via API

When querying a Group Flag, you **must** specify the environment using the `env` parameter:

```bash
GET https://api.rocketflag.app/v1/flags/{flag_id}?env=production
```

If the `env` parameter is missing or does not match an environment defined for that flag, the API will return a `404 Not Found`.

### Caretaker Integration

Group flags are fully integrated with RocketFlag's **Caretaker** on the Teams tier and above. If a group flag is fully rolled out across all environments and left unchanged (or gets no traffic), the Caretaker will mark it as stale or dormant. When stale flags exist in the project, an **Only show stale flags** switch appears next to the filter input to view only the affected group flags.

When removing a group flag, the Caretaker tab can generate an environment-aware **removal prompt** for your AI coding agent, detailing the active state of each environment. Note that if the group flag still has cohort or audience targeting attached (either globally or overridden on any environment), the Caretaker will withhold prompt generation and indicate that the flag is not ready for removal until all cohort and audience targeting is cleared. See [Managing Stale Flags](/guides/stale-flags/) for details.
