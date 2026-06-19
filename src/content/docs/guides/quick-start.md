---
title: Quick Start Guide
description: Get up and running with RocketFlag in 5 minutes.
---

Welcome to RocketFlag! This guide will walk you through the process of setting up your first feature flag and evaluating it in your application.

### Step 1: Create a Project
Projects group related flags. When you first sign in you can create a project straight away — no setup required.

You have two options:

- **Personal project (quickest):** owned by just you. Perfect for trying RocketFlag, side projects, or solo development. The free tier includes up to **3 personal projects**.
- **Organisation project:** owned by an Organisation (a shared workspace) so you can invite teammates and use team features. Choose this if you're working with others — see [Organisations & Users](/guides/organisations-and-users/).

For this guide a **personal project** is perfectly fine; you can always [move it into an Organisation later](/guides/projects-and-environments/#moving-a-project-into-an-organisation) without changing your flag IDs.

1. On your dashboard, click **New Project**.
2. Give it a name (e.g., "Web App").
3. For this guide, select **Single Environment**.
4. Set the environment name to `production`.
5. Click **Create**.

### Step 2: Create your First Flag
Now, let's create a flag to control a new feature.

1. Click **New Flag** inside your project.
2. **Name:** `enable-new-header`
3. **Enabled:** Toggle this to **ON**.
4. **Traffic Percentage:** Set this to `100`.
5. Click **Create**.

### Step 3: Evaluate the Flag
Copy your **Flag ID** from the table. You can now call the RocketFlag Public Evaluation API to check the flag's state.

#### Using Curl
Replace `{FLAG_ID}` with the ID you copied:

```bash
curl https://api.rocketflag.app/v1/flags/{FLAG_ID}
```

#### Expected Response
```json
{
  "id": "{FLAG_ID}",
  "name": "enable-new-header",
  "enabled": true
}
```

### Next Steps
- [Learn about Multi-Environment Projects](./environment-management)
- [Explore Advanced Targeting with Cohorts](../intro/concepts#cohorts)
- [Install an SDK](../../dev/api-reference)
