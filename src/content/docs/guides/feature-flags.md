---
title: Feature Flags
description: Creating and managing individual feature flags.
---

Feature flags are the building blocks of RocketFlag. They allow you to toggle features on and off in real-time.

### Creating a Flag

1. Enter the project where you want to add the flag.
2. Click **New Flag**.
3. Fill in the details:
   - **Name:** A human-readable name for the flag (up to 50 characters; accepts everyday punctuation).
   - **Description:** (Optional) Explain what this flag controls (up to 250 characters; free text and formatting accepted).
   - **Enabled:** The initial state of the flag.
   - **Traffic Percentage:** Set to 100 for a full release, or lower for a partial rollout. Partial rollouts are [sticky per user](#sticky-rollouts).
   - **Tags:** (Optional) Add labels to categorize and filter your flags (e.g., `frontend`, `v2-release`).
   - **Cohorts:** (Optional) A list of specific user identifiers that always get the enabled value.
4. Click **Create**.

After creating the flag, click **Edit** to restrict it to an [audience](/guides/audiences/). In the editor the cohort list is labelled **Always on for** and the percentage is labelled **Rollout**.

### Managing Flags

#### Toggling
You can toggle a flag on or off instantly from the flags table using the switch in the "Enabled" column.

#### Searching and Filtering
You can quickly find flags in the flags table using the search filter. The search is case-insensitive and filters flags matching any of the following:
- **Name:** The human-readable name of the flag.
- **ID:** The unique flag ID.
- **Description:** Text within the flag's description.
- **Tags:** Any tags assigned to the flag.

When a project has flags identified as stale by the [Caretaker](/guides/stale-flags/), an **Only show stale flags** toggle switch appears next to the search bar to let you quickly narrow the view down to flags ready for retirement.


#### Partial Rollouts (Traffic Percentage)
By setting the traffic percentage to a value like `10%`, the flag will evaluate to `true` for about 10% of users. The rollout is **sticky**: the same user gets the same answer on every request, as long as you send a stable identifier (see [Sticky rollouts](#sticky-rollouts)). Without an identifier, each request is an independent random roll.

#### Sticky rollouts
To keep a user's experience consistent, send a stable identifier with each evaluation request. RocketFlag uses the first of these that is present:

1. The `targetingKey` parameter.
2. Otherwise, the `cohort` parameter.
3. Otherwise there is no key, and the percentage is a fresh random roll on every request.

The key is hashed together with the flag ID, and the result is a bucket from 0 to 99:

```text
bucket = FNV1a64(flagId + ":" + key) % 100
enabled = bucket < trafficPercentage
```

FNV-1a is the 64-bit variant (offset basis `14695981039346656037`, prime `1099511628211`) over the UTF-8 bytes of the flag ID, a single `:`, and the key. A percentage of 100 or more is always enabled and 0 or less is always disabled, without hashing. Some properties follow from this:

- **Raising the percentage only adds users.** Anyone already enabled stays enabled as you go from 10% to 50% to 100%.
- **Each flag buckets independently.** The flag ID is part of the hash, so one user is not always in the first 10% of every flag.
- **Environments share a bucket.** The environment is not part of the hash, so a key lands in the same bucket in every environment of a group flag.
- **The key is only ever hashed.** RocketFlag only hashes the key. It is not saved with your flag data, written to analytics or included in RocketFlag's application logs. Like any URL parameter, it can appear in infrastructure request logs, so prefer a stable opaque identifier, such as a user ID, over an email address.

Three worked examples, handy for testing your own integration:

| Flag ID | Key | Bucket | Enabled at |
| :--- | :--- | :--- | :--- |
| `flag_123` | `user-42` | 10 | 11% and above |
| `flag_123` | `user-43` | 21 | 22% and above |
| `abc` | `alice@example.com` | 92 | 93% and above |

#### Targeting with Cohorts
Cohorts (shown in the console as **Always on for**) enable a feature for specific users, such as `admin@example.com` or `beta-tester-1`. 
- Enter identifiers as a comma-separated list.
- When calling the API or SDK, pass the identifier in the `cohort` parameter.
- If the identifier matches any entry in the cohort list, the flag evaluates to `true` regardless of the traffic percentage or any audience (provided the flag is enabled). **A cohort match is always on.**
- If a flag has cohorts but no audience, a request that does not match the list evaluates to `false`. To open a cohort-gated flag to a percentage of everyone else, use an audience.

Cohorts are an exact list of people. To target by attributes such as plan or region, use an [audience](/guides/audiences/). See [how a flag is evaluated](/guides/audiences/#how-a-flag-is-evaluated) for the full order of checks.

### Audit History
To view the full history of changes for any flag:
1. Click on the flag name in the flags table to open the **Flag Details** drawer.
2. Select the **Activity** tab.
Here you can see every change made to that flag, including who made the change and when. Expanding an entry shows a highlighted diff of what changed (removed values in red, added values in green, and unchanged values dimmed).

