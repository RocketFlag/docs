---
title: Feature Flags
description: Creating and managing individual feature flags.
---

Feature flags are the building blocks of RocketFlag. They allow you to toggle features on and off in real-time.

### Creating a Flag

1. Enter the project where you want to add the flag.
2. Click **New Flag**.
3. Fill in the details:
   - **Name:** A human-readable name for the flag.
   - **Description:** (Optional) Explain what this flag controls.
   - **Enabled:** The initial state of the flag.
   - **Traffic Percentage:** Set to 100 for a full release, or lower for a partial rollout.
   - **Tags:** (Optional) Add labels to categorize and filter your flags (e.g., `frontend`, `v2-release`).
   - **Cohorts:** (Optional) A list of specific user identifiers to target.
   - **Protected Key:** (Optional) A security key required for API access.
4. Click **Create**.

### Managing Flags

#### Toggling
You can toggle a flag on or off instantly from the flags table using the switch in the "Enabled" column.

#### Searching and Filtering
You can quickly find flags in the flags table using the search filter. The search is case-insensitive and filters flags matching any of the following:
- **Name:** The human-readable name of the flag.
- **ID:** The unique flag ID.
- **Description:** Text within the flag's description.
- **Tags:** Any tags assigned to the flag.

#### Partial Rollouts (Traffic Percentage)
By setting the traffic percentage to a value like `10%`, the flag will only evaluate to `true` for 10% of requests. 
> **Note:** Traffic evaluation is randomized per request. If you need consistency for a specific user, use **Cohorts**.

#### Targeting with Cohorts
Cohorts allow you to enable a feature for specific users, such as `admin@example.com` or `beta-tester-1`. 
- Enter identifiers as a comma-separated list.
- When calling the API or SDK, pass the identifier in the `cohort` parameter.
- If the identifier matches any entry in the cohort list, the flag evaluates to `true` regardless of the traffic percentage (provided the flag is enabled).

#### Protected Keys
If you set a **Protected Key**, the RocketFlag API will return a `404 Not Found` for that flag unless the correct key is provided in the request headers or query parameters. This prevents unauthorized users from discovering your flag names or states.

### Audit History
To view the full history of changes for any flag:
1. Click on the flag name in the flags table to open the **Flag Details** drawer.
2. Select the **Activity** tab.
Here you can see every change made to that flag, including who made the change and when.

