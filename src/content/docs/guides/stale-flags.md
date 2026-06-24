---
title: Managing Stale Flags
description: Use the Caretaker to find and safely remove flags you no longer need.
---

Feature flags are meant to be temporary. Once a feature is fully rolled out, the flag (and the conditional branches around it in your code) becomes technical debt. RocketFlag's **Caretaker** automatically watches your flags (including multi-environment **group flags**), flags the ones that look ready to retire, and helps you remove them from your codebase.

> **Availability:** Caretaker is available for **projects that belong to an Organisation on the Teams tier or above**. Personal/legacy projects without an Organisation don't have Caretaker.

### How Caretaker Classifies Flags

RocketFlag periodically evaluates every flag (and group flag) and assigns it a **Caretaker status**:

| Status      | Meaning                                                                                          |
| :---------- | :----------------------------------------------------------------------------------------------- |
| **Healthy** | Evaluated recently with normal usage patterns. No action needed.                                 |
| **Stale**   | Fully rolled out (pinned at a fixed traffic percentage) and unchanged for **30+ days**, while still receiving high traffic. It's probably safe to remove. |
| **Dormant** | Has received **no evaluations for 60+ days**. The flag may already be gone from your code, or it's dead code. |
| **Snoozed** | You've chosen to ignore this flag for a period (see [Snoozing](#snoozing-a-flag)).               |

Healthy flags are left alone. When a flag becomes **stale** or **dormant**, RocketFlag surfaces it so you can act.

### Spotting Flags That Need Attention

When a flag (or group flag) is stale or dormant, a **Caretaker** badge appears next to its name in the flags table. Hover the badge for a short explanation of why the flag was flagged.

To act on a flagged flag:

1. Open the flag's detail view (click the flag in the table).
2. Select the **Caretaker** tab. *(This tab only appears when the flag is stale or dormant.)*

The tab shows the current status, an explanation, and the available actions.

#### Weekly Email Digests

In addition to badges in the web console, Organisation Admins of Organisations on the Teams tier or above receive a weekly email digest summarizing all flags (and group flags) that have newly become stale or dormant during that week's scan.

### Removing a Flag with an AI Coding Agent

The Caretaker tab can generate a tailored **removal prompt** for the flag — context about the flag, its configuration, and its history, written as instructions for an AI coding agent.

- **For single flags:** The prompt generates code removal instructions tailored to the flag's single-environment configuration.
- **For group flags:** The prompt is environment-aware. It lists each environment's rollout configuration and instructs your agent to remove the flag. It only commits to a specific branch when all environments agree; otherwise, it tells the agent that the live state/branch differs across environments and requests human verification.

1. In the Caretaker tab, click **Generate prompt**.
2. Click **Copy**.
3. Paste it into your AI coding agent (Cursor, GitHub Copilot, Claude, etc.).

The agent uses the prompt to find and remove the flag's conditional branches from your codebase, leaving only the "feature on" path. Review the change as you would any other pull request, then [delete the flag](/guides/feature-flags/) in RocketFlag once it's no longer referenced.

### Snoozing a Flag

Not ready to remove a flag yet? Snooze it so it stops appearing as needing attention:

- In the Caretaker tab, choose **Snooze 30 days**, **Snooze 60 days**, or **Snooze 90 days**.
- The flag's status becomes **Snoozed** until the date you chose, and the Caretaker badge is hidden.
- When the snooze expires, the Caretaker will re-evaluate and re-flag the flag if it's still stale or dormant.

To bring a snoozed flag back early, open its Caretaker tab and click **Unsnooze**.

### A Suggested Workflow

1. Once a week, scan your projects for **Caretaker** badges.
2. For each flagged flag, decide: **remove**, or **snooze** if there's a reason to keep it.
3. To remove, generate the prompt, run it through your coding agent, merge the cleanup, then delete the flag.

Keeping on top of stale flags reduces conditional branches in your code, simplifies your logic, and keeps your flag list meaningful. See also [Best Practices & Workflow](/guides/best-practices/#2-flag-lifecycle--stale-flags).
