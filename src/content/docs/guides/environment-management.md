---
title: Environment Management
description: How to structure and call flags across different environments.
---

Managing feature flags across multiple environments (Development, Staging, Production) is a core feature of RocketFlag. There are two primary ways to structure your environments.

### 1. Multi-Environment Projects (Recommended)
This approach uses **Group Flags**, allowing you to manage a single flag across multiple environments in one view.

#### Setup
1. Create a project and select **Multi Environment**.
2. Click **Environment Labels** and add your environments (e.g., `dev`, `staging`, `prod`). **Note:** Environment names can only contain letters, numbers, hyphens, and underscores.
3. Create a **Group Flag**. You will be asked to set the initial state for each environment.

#### Calling the API
When calling the API for a Group Flag, you **must** provide the `env` parameter exactly as it appears in your environment labels (case-sensitive):

```bash
# Get the state for the 'production' environment
GET https://api.rocketflag.app/v1/flags/{FLAG_ID}?env=production

# Get the state for the 'staging' environment
GET https://api.rocketflag.app/v1/flags/{FLAG_ID}?env=staging
```

### 2. Project-per-Environment
In this approach, you create entirely separate RocketFlag projects for each environment (e.g., "My App - Dev" and "My App - Prod").

- **Pros:** Total isolation between environments.
- **Cons:** You have to manage two separate flag IDs for the same feature in your code.

#### Implementation Pattern
If you use this approach, you typically store the Flag ID in your application's environment variables:

```javascript
// .env.production
FLAG_ID_NEW_FEATURE=ABC123PROD

// .env.development
FLAG_ID_NEW_FEATURE=XYZ789DEV

// Application code
const flagId = process.env.FLAG_ID_NEW_FEATURE;
const flag = await rocketflag.getFlag(flagId);
```

### Which should I use?
We recommend **Multi-Environment Projects** for most teams. It reduces configuration overhead by keeping the Flag ID consistent across all environments, while still giving you the power to toggle features independently.

### Important: Renaming Environments
If you rename an environment label in the RocketFlag UI, you **must** update the `env` parameter in your application code. The API will return a `404 Not Found` if it receives an environment name it doesn't recognize.
