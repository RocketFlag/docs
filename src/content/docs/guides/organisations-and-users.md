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
3. Enter their email address and select an initial role (**Admin**, **Editor**, or **Viewer**):
   - **Admin:** Full management of projects, flags, environment labels, member invitations/roles (up to Admin), and project sharing.
   - **Editor:** Can create, update, and toggle flags, group flags, and project content.
   - **Viewer:** Read-only access to projects and flags.

> **Note on Owner Role:** The **Owner** role cannot be selected on initial invitation. To grant Owner status, invite the user first and promote them from the **Members** list once their status becomes Active.

#### Roles & Permissions

RocketFlag uses a ranked four-tier role hierarchy (`Owner > Admin > Editor > Viewer`):

- **Owner:** Complete control over the Organisation, including billing management (checkout, Stripe portal, plan changes, and cancellations) and member roles. Every Organisation must retain at least one active Owner.
- **Admin:** Can manage all projects, flags, group flags, environment labels, member invitations/roles (up to Admin), and project sharing. Cannot manage billing settings or remove/demote Owners.
- **Editor:** Can manage flag content (create, update, toggle flags and group flags). Cannot delete projects or flags, change Organisation settings, or manage members.
- **Viewer:** Read-only access to Organisation projects and flags. Cannot create, update, or toggle flags, nor change settings.

> **Last Owner Guard:** An Organisation cannot demote or remove its last active Owner. You must promote another active member to Owner first.

#### Member Status

- **Pending:** The user has been invited but has not yet accepted via the invitation email.
- **Active:** The user has joined and has access to the Organisation.

### Enterprise SAML SSO

Organisations on the **Ultra** tier can configure **Enterprise SAML Single Sign-On (SSO)** via Identity Platform.

- **Seamless Sign-In:** Allows team members to sign in using your company's corporate identity provider (IdP).
- **Domain Lookup:** Users entering an email address matching a configured SAML domain are automatically routed to your identity provider.

### Organisation Tiers

RocketFlag offers several tiers to suit your needs:

| Feature                 | Free   | Teams     | Ultra     |
| :---------------------- | :----- | :-------- | :-------- |
| **Seat Limit**          | 1 User | Unlimited | Unlimited |
| **Multi-Env Flags**     | Yes    | Yes       | Yes       |
| **Protected Keys**      | No     | Yes       | Yes       |
| **Analytics (7 days)**  | No     | Yes       | Yes       |
| **Org-wide Audit Logs** | No     | No        | Yes       |
| **Enterprise SAML SSO** | No     | No        | Yes       |

### Managing Billing

Organisation **Owners** can view and manage subscription plans, activate trials, and update payment information from the **Billing** section of Organisation settings.

#### Self-Serve Billing Portal

Owners can click **Manage Payment Method** in Organisation Billing to launch the secure Stripe billing portal. The portal allows you to:

- Switch self-serve between subscription plans (e.g., Teams and Ultra)
- Update credit card or payment details on file
- Download past invoices and receipts
- Schedule period-end cancellations or resume pending cancellations before the period ends

#### Teams Trial

New Organisations on the Free tier can activate a **14-day free trial** of the Teams tier to explore advanced features.

- The trial can be activated once per Organisation by an Owner or Admin.
- After 14 days, the Organisation will revert to the Free tier unless a paid subscription is started.
