---
title: Go SDK
description: Using the RocketFlag SDK in your Go applications.
---

The RocketFlag Go SDK is a high-performance client for interacting with the RocketFlag API in your backend services.

### Installation

```bash
go get github.com/rocketflag/go-sdk
```

### Basic Usage

```go
package main

import (
	"fmt"
	"log"
	rocketflag "github.com/rocketflag/go-sdk"
)

func main() {
	// Initialize the client
	rf := rocketflag.NewClient()

	// Fetch a flag
	flagKey := "your-flag-id"
	flag, err := rf.GetFlag(flagKey, rocketflag.UserContext{})
	if err != nil {
		log.Fatalf("Error fetching flag: %v", err)
	}

	if flag.Enabled {
		fmt.Printf("Feature '%s' is enabled!\n", flag.Name)
	}
}
```

### Advanced Usage

#### Working with Cohorts
Pass a `UserContext` with a "cohort" key:

```go
userContext := rocketflag.UserContext{"cohort": "user@example.com"}
flag, err := rf.GetFlag(flagKey, userContext)
```

#### Attributes and sticky rollouts
Add a `targetingKey` for sticky percentage rollouts, and any other keys as audience attributes:

```go
userContext := rocketflag.UserContext{
	"targetingKey": "user-42",
	"plan":         "pro",
	"country":      "AU",
}
flag, err := rf.GetFlag(flagKey, userContext)
```

Percentage rollouts are sticky per key: the same `targetingKey` (or, without one, the same `cohort`) gets the same answer every time, so send a stable user identifier. Other keys are matched against the flag's [audience](/guides/audiences/) and are only read when the flag has one. Matching is exact and case-sensitive, and an attribute you do not send never matches. `cohort`, `env` and `targetingKey` are reserved and cannot be audience attributes. No SDK signature changed: this is the same context you already pass. See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts). With caching on, each distinct `targetingKey` is a separate cache entry.

#### Working with Group Flags (Environments)
Specify the environment in the `UserContext`:

```go
userContext := rocketflag.UserContext{"env": "production"}
flag, err := rf.GetFlag(flagKey, userContext)
```

### Custom Configuration

Customize the client by passing functional options to `NewClient`:

```go
rf := rocketflag.NewClient(
	rocketflag.WithAPIURL("https://api.custom.com"),
	rocketflag.WithVersion("v2"),
	rocketflag.WithHTTPClient(customHTTPClient),
)
```

### Caching Responses

To avoid hitting the API on every check, enable an in-memory cache by providing a default TTL via `WithCache`. Cached entries are keyed by flag ID **and** the user context, so different cohorts or environments still resolve independently.

```go
import (
	"time"
	rocketflag "github.com/rocketflag/go-sdk"
)

// Enable response caching with a 5-minute default TTL.
rf := rocketflag.NewClient(rocketflag.WithCache(5 * time.Minute))

// First call hits the API; subsequent calls within the TTL are served from cache.
flag, err := rf.GetFlag("your-flag-id", rocketflag.UserContext{})
```

You can override the TTL for a single call — or disable caching for that call — with `WithCallTTL`:

```go
// Force a fresh fetch, bypassing the cache for this call.
flag, err := rf.GetFlag("your-flag-id", nil, rocketflag.WithCallTTL(0))

// Use a shorter TTL just for this call.
flag, err := rf.GetFlag("your-flag-id", nil, rocketflag.WithCallTTL(10*time.Second))
```

Caching is **opt-in** — without `WithCache` or a per-call override, every call goes directly to the API.
