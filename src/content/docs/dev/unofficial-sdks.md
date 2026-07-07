---
title: Unofficial SDKs
description: Community-maintained SDKs for RocketFlag.
---

Alongside the official SDKs, members of the community have built their own SDKs for RocketFlag. These are maintained by their respective authors, not by RocketFlag.

:::note
Unofficial SDKs are not maintained, reviewed, or supported by RocketFlag. Please report issues or feature requests directly to the SDK's repository.
:::

### Java

A community-built Java SDK by [gustavomr](https://github.com/gustavomr), modelled on the official Go SDK. It supports fetching flags, user context (cohorts), and opt-in response caching, and requires Java 11 or higher.

- Repository: [github.com/gustavomr/java-sdk](https://github.com/gustavomr/java-sdk)

```java
import app.rocketflag.*;

Client rf = Client.newClient();
FlagStatus flag = rf.getFlag("flag-id", UserContext.withCohort("user@example.com"));

if (flag.isEnabled()) {
    System.out.println("Feature '" + flag.getName() + "' is enabled!");
}
```

### Building your own SDK?

The RocketFlag API is a simple REST API — see the [API Reference](/dev/api-reference/) to get started. If you've built an SDK you'd like listed here, open a pull request against the [docs repository](https://github.com/RocketFlag/docs).
