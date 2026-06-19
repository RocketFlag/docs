---
title: Projects & Environments
description: Organizing your flags into projects and environments.
---

Projects are the primary way to organize your feature flags in RocketFlag.

### Personal vs Organisation Projects

Every project is owned either by **you** (a personal project) or by an **Organisation** (a shared workspace).

- **Personal projects** need no setup — create one as soon as you sign in. The free tier includes up to **3 personal projects**, making them ideal for trying RocketFlag, side projects, and solo work.
- **Organisation projects** are owned by an Organisation so your team can collaborate. They unlock team features — inviting members, [project sharing](#sharing-a-project-with-specific-people), the stale-flag [Caretaker](/guides/stale-flags/), [analytics](/guides/analytics-and-stats/), and organisation-wide [audit logs](/guides/audit-logs/) — and remove the personal-tier project limit. See [Organisations & Users](/guides/organisations-and-users/).

Not sure which to pick? Start with a personal project and [move it into an Organisation](#moving-a-project-into-an-organisation) whenever you're ready — your flag IDs don't change.

### Creating a Project

When you create a project from the **Projects** page, it's a **personal** project. To create a project inside an Organisation, open that Organisation first, then create the project there.

1. Navigate to the **Projects** page.
2. Click **New Project**.
3. Choose your project type:
   - **Single Environment:** A straightforward container for flags.
   - **Multi-Environment:** For managing flags across Dev, Staging, and Production.
4. Enter a **Name** and an initial **Environment** (e.g., "Production" or "Main").
5. Click **Create**.

### Project Types

#### Single Environment Projects
Use this if you have a simple application or if you prefer to have entirely separate projects for each of your environments (e.g., one project called "My App - Dev" and another called "My App - Prod").

#### Multi-Environment Projects (Recommended)
This type allows you to define "Environment Labels" (like `dev`, `staging`, `prod`) at the project level. When you create a flag within this project, you can manage its state for each of these environments simultaneously.

### Managing Environment Labels (Multi-Env)

If you are using a Multi-Environment project:
1. Open your project and click the **Environment Labels** button.
2. Add the names of your environments (e.g., `dev`, `qa`, `prod`).
3. These labels will now be available as targets for all Group Flags in this project.

### Project Visibility

Every project that belongs to an Organisation is visible to **all members of that Organisation**. Admins can manage all projects; Members can manage flags within them. See [Organisations & Users](/guides/organisations-and-users/) for roles.

### Sharing a Project with Specific People

Beyond Organisation-wide visibility, you can share an individual project with specific people by email — useful for granting access to a contractor or a teammate outside the project's Organisation.

> **Availability:** Project sharing requires the **Teams** tier or above.

1. On the **Projects** page, click the **Share** (people) icon on the project you want to share.
2. In the **Shared with** box, enter a **comma-separated list of email addresses** (e.g. `alice@example.com,bob@example.com`).
3. Click **Update**.

Adding an email shares the project with that person; removing an email revokes their access. People you share with will find the project in their **Shared with me** view when they sign in.

### Moving a Project into an Organisation

If you have a personal project (one that isn't yet part of an Organisation), you can move it into an Organisation so your team can collaborate on it.

1. On the **Projects** page, click the **Move to Organisation** icon on the project.
2. Choose the **destination Organisation**. *(You must be an Admin of the destination Organisation.)*
3. Click **Move Project**.

All existing flags and evaluations continue to work without interruption — flag IDs don't change, so your application keeps working through the move.
