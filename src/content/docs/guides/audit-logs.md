---
title: Audit Logs
description: Tracking changes and history in RocketFlag.
---

RocketFlag provides detailed **Audit Logs** to help you track changes, debug issues, and maintain compliance.

### What is Recorded?

An audit entry is created for significant actions across flags and organisation management:
- **Flag Activity:** Creating, updating (including name, description, traffic percentage, or cohort overrides), toggling, or deleting flags.
- **Organisation & Team Changes:** Organisation creation, inviting members, updating member roles, and removing members.

### Viewing Audit Logs

#### Flag-Level Logs
To see the history of a specific flag:
1. Navigate to the project containing the flag.
2. Click on the flag name in the table to open the **Flag Details** drawer.
3. Select the **Activity** or **History** tab.
4. A list of all historical changes for that flag will be displayed, including the action, the data changed, the timestamp, and the author.

#### Organisation-Level Logs (Ultra Tier)
Organisations on the **Ultra** tier have access to a global audit feed. This allows Owners and Admins to monitor activity across the entire workspace.
- **Access:** Found in the main navigation bar under **Audit Logs**.
- **Filtering:** You can filter the logs by **Project**, **Author** (email), and **Date Range**.
- **Export:** Audit logs can be viewed in the dashboard to maintain a complete trail of all configuration changes.


### Why Use Audit Logs?

- **Accountability:** Know exactly who changed a flag's state and when.
- **Debugging:** If a feature suddenly stops working or behaves unexpectedly, check the audit logs to see if a flag toggle or traffic change coincided with the issue.
- **Compliance:** Maintain a record of all feature releases and configuration changes for security audits.
