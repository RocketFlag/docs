---
title: Protected Keys
description: Securing your feature flags with protected keys.
---

**Protected Keys** are an optional security feature designed to prevent unauthorized access to flag names and statuses.

### How it Works

When a Protected Key is enabled for a flag, the RocketFlag API will only return a successful response if the correct key is provided in the request. If the key is missing or incorrect, the API returns a **404 Not Found**.

This ensures that even if someone guesses your flag ID, they cannot determine if the flag exists or what its state is without the key.

### Setting Up a Protected Key

1.  Navigate to your flag settings.
2.  Find the **Protected Key** field.
3.  Enter a secret key (or generate a random one).
4.  Save the flag.

### Using Protected Keys in Requests

You can provide the protected key to the API in two ways:

#### 1. Via HTTP Header
Include a header named `x-rocketflag-key`.

```bash
curl -H "x-rocketflag-key: YOUR_SECRET_KEY" \
  "https://api.rocketflag.app/v1/flags/YOUR_FLAG_ID"
```

#### 2. Via Query Parameter
Add a `key` parameter to the URL.

```bash
curl "https://api.rocketflag.app/v1/flags/YOUR_FLAG_ID?key=YOUR_SECRET_KEY"
```

### SDK Integration

Both the Node.js and Go SDKs support protected keys by passing the key in the context/options object when calling `getFlag`.

- **Node.js:** `await rocketflag.getFlag(flagId, { key: "YOUR_SECRET_KEY" })`
- **Go:** `rf.GetFlag(flagId, rocketflag.UserContext{ "key": "YOUR_SECRET_KEY" })`
