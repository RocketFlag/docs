---
title: Accounts & Sign-in
description: How to create a RocketFlag account and sign in.
---

RocketFlag is managed through the web console at [console.rocketflag.app](https://console.rocketflag.app). Creating an account is free and takes less than a minute — there's no separate "sign up" step, signing in for the first time creates your account.

### Ways to Sign In

RocketFlag offers options for individual users and enterprise teams. Whichever method you choose the first time becomes your account identity, so use the same method each time.

#### Continue with GitHub
Click **Sign in with GitHub** and authorise RocketFlag. On your first sign-in you'll be asked for a **display name** to identify you to your teammates (for example in audit logs).

#### Continue with Google
Click **Sign in with Google** and pick your Google account.

#### Email magic link (passwordless)
Enter your email address and we'll send you a unique sign-in link.

> **RocketFlag does not use or store passwords.** Each sign-in sends a fresh, single-use link to your inbox.

Open the link to complete sign-in. If you open the link on a **different device or browser** from the one you requested it on, you'll be asked to re-enter your email address to confirm it's you.

#### Enterprise SAML Single Sign-On (SAML SSO)
For organisations on the **Ultra** tier with SAML SSO configured, team members can sign in using their corporate Identity Provider (IdP). Enter your work email address to be automatically directed to your company's SAML login portal. See [Enterprise SAML SSO](/guides/organisations-and-users/#enterprise-saml-sso).

### After Signing In

When you sign in for the first time without any projects or organisations, RocketFlag guides you through setting up an **Organisation** with a **14-day Teams trial** by default (no credit card required). This provides instant access to team features like member invitations, project sharing, Caretaker, and analytics.

If you prefer working solo, you can choose to create a **personal project** instead. You can also create personal projects or additional organisations at any time.

1. **Set up an Organisation (recommended):** Creates your shared workspace and starts a 14-day free trial of the Teams tier. See [Organisations & Users](/guides/organisations-and-users/).
2. **Create a Personal Project:** Quick start for solo development with no extra setup. Follow the [Quick Start Guide](/guides/quick-start/).

### Managing Your Account

You can update your profile and manage your account from the **Account** area of the console. Billing and subscription settings live under your Organisation and are managed by Organisation **Owners** — see [Organisations & Users](/guides/organisations-and-users/#managing-billing).

For legacy individual subscriptions, you can update payment details, download past invoices, and manage your subscription by clicking **Manage Payment Method** in the **Account** area under **Subscriptions**.

#### Deleting Your Account

If you wish to close your RocketFlag account:

1. Navigate to the **Account** area of the console.
2. Scroll to the bottom and click **Delete Account**.
3. Confirm the deletion.

**Important Safety Rules for Deletion:**
- **Last Owner/Admin Protection:** To prevent orphaned Organisations and lost resources, you **cannot** delete your account if you are the last active **Owner** or **Admin** of any Organisation. You must first promote another member to Owner/Admin, assign a new Owner/Admin, or delete/disband the Organisation first.
- **Subscription Cancellation:** When you delete your account, any active user-level subscription is automatically cancelled.
- **Data Cleanup:** All of your personal projects and user details will be permanently removed.

### Inviting Teammates

You don't need to share credentials to collaborate. Invite teammates to your Organisation by email and they'll sign in with their own account. See [Inviting Members](/guides/organisations-and-users/#inviting-members).
