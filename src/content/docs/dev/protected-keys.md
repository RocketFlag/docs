---
title: Protected Keys
description: Protected keys have been retired in RocketFlag 2.7.0.
---

> **Note:** **Protected Keys have been retired as of RocketFlag 2.7.0.** The feature has been removed from both the console and the public Evaluation API.

### Overview

Protected Keys previously allowed you to require a shared secret in front of a flag's evaluation. A check across production showed no flags or group flags actively using this feature, so it was removed in RocketFlag 2.7.0 to simplify flag evaluation and reduce latency.

### Upgrading from Protected Keys

- **Console:** The **Protected Key** field is no longer present when creating or editing flags.
- **API & SDKs:** Evaluation requests no longer require or validate the `key` query parameter or `x-rocketflag-key` header. If your application code passes a `key` parameter or context, you can safely remove it. Flag state is evaluated strictly by Flag ID, environment, and user cohort.
