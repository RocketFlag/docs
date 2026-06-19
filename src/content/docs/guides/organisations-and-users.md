---
title: Organisations & Users
description: How to manage your team and workspace in RocketFlag.
---

Managing your team effectively is key to a smooth feature flagging workflow. RocketFlag uses an **Organisation** model to group projects and people.

> **Do I need an Organisation?** No. You can create [personal projects](/guides/projects-and-environments/#personal-vs-organisation-projects) (up to 3 on the free tier) and use the API and SDKs without ever creating one. Create an Organisation when you want to **work with a team** or use team features — inviting members, project sharing, the stale-flag Caretaker, analytics, and organisation-wide audit logs. You can [move existing personal projects into an Organisation](/guides/projects-and-environments/#moving-a-project-into-an-organisation) in one click.

### Creating an Organisation

1. Navigate to the **Organisations** page.
2. Click **New Organisation**.
3. Give your organisation a name and click **Create**.

### Managing Users

You can invite teammates to your Organisation to collaborate on projects.

#### Inviting Members

1. Within your Organisation dashboard, find the **Members** section in the navigation header.
2. Click **Invite Member**.
3. Enter their email address and select a role:
   - **Admin:** Can manage all projects, flags, members, and billing settings. Admins are the only users who can **delete** projects.
   - **Member:** Can view and manage flags within projects and create new projects, but cannot change organization-level settings or delete projects.

#### Member Status

...

- **Pending:** The user has been invited but has not yet accepted via the invitation email.
- **Active:** The user has joined and has access to the Organisation.

### Organisation Tiers

RocketFlag offers several tiers to suit your needs:

| Feature                 | Free   | Teams    | Ultra     |
| :---------------------- | :----- | :------- | :-------- |
| **Seat Limit**          | 1 User | 50 Users | Unlimited |
| **Multi-Env Flags**     | Yes    | Yes      | Yes       |
| **Protected Keys**      | No     | Yes      | Yes       |
| **Analytics (7 days)**  | No     | Yes      | Yes       |
| **Org-wide Audit Logs** | No     | No       | Yes       |

#### Teams Trial

New Organisations on the Free tier can activate a **14-day free trial** of the Teams tier to explore advanced features.

- The trial can be activated once per Organisation by an Admin.
- After 14 days, the Organisation will revert to the Free tier unless a paid subscription is started.

You can view and manage your subscription or activate your trial in the **Billing** section of your Organisation settings.
