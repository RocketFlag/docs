---
title: Organisations & Users
description: How to manage your team and workspace in RocketFlag.
---

Managing your team effectively is key to a smooth feature flagging workflow. RocketFlag uses an **Organisation** model to group projects and people.

### Creating an Organisation

When you first sign up for RocketFlag, you will be prompted to create your first Organisation.

1. Navigate to the **Organisations** page.
2. Click **New Organisation**.
3. Give your organization a name and click **Create**.

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
