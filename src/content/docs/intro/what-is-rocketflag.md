---
title: What is RocketFlag?
description: An overview of the RocketFlag feature flagging service.
---

RocketFlag is a lightweight, high-performance feature flagging service designed to help developers release code faster and with more confidence. 

By separating code deployment from feature release, RocketFlag allows you to:

- **Control Rollouts:** Enable features for a sticky percentage of users, specific user cohorts, or an [audience](../../guides/audiences/) defined by attributes such as plan or region.
- **Manage Multiple Environments:** Seamlessly handle flag states across Dev, Staging, and Production.
- **Reduce Risk:** Quickly toggle features off if issues are detected, without requiring a new deployment.
- **Team Collaboration:** Manage organizations, projects, and users with role-based access.

### Core Philosophy

RocketFlag aims to answer one simple question as fast as possible: **"Is this feature enabled for this user?"**

The service is built with a focus on:
1. **Speed:** Low-latency API responses.
2. **Simplicity:** A clean UI and straightforward SDKs.
3. **Safety:** Per-environment isolation.

Next: [Learn about RocketFlag Concepts](../concepts)
