---
title: Go SDK
description: Using the RocketFlag SDK in your Go applications.
---

The RocketFlag Go SDK is a high-performance client for interacting with the RocketFlag API in your backend services.

### Installation

```bash
go get github.com/rocketflag/go-sdk/v2
```

### Basic Usage

```go
package main

import (
	"context"
	"fmt"
	"log"

	rocketflag "github.com/rocketflag/go-sdk/v2"
)

func main() {
	// Initialize the client
	rf := rocketflag.NewClient()

	// Fetch a flag
	flagKey := "your-flag-id"
	flag, err := rf.GetFlag(context.Background(), flagKey, nil)
	if err != nil {
		log.Fatalf("Error fetching flag: %v", err)
	}

	if flag.Enabled {
		fmt.Printf("Feature '%s' is enabled!\n", flag.Name)
	}
}
```

`GetFlag` binds the request to the context you pass, so cancelling it or passing its deadline aborts the request. In a request handler, pass the handler's context (`r.Context()`); elsewhere, set a timeout:

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

flag, err := rf.GetFlag(ctx, flagKey, nil)
```

### Advanced Usage

#### Working with Cohorts
Pass a `UserContext` with a "cohort" key:

```go
userContext := rocketflag.UserContext{"cohort": "user@example.com"}
flag, err := rf.GetFlag(ctx, flagKey, userContext)
```

#### Attributes and sticky rollouts
Add a `targetingKey` for sticky percentage rollouts, and any other keys as audience attributes:

```go
userContext := rocketflag.UserContext{
	"targetingKey": "user-42",
	"plan":         "pro",
	"country":      "AU",
}
flag, err := rf.GetFlag(ctx, flagKey, userContext)
```

- **`targetingKey`**: a stable identifier for the user. The same key always gets the same answer from a percentage rollout, in every environment of a group flag, and raising the percentage only ever adds users. Without a `targetingKey` the `cohort` is used, and with neither each request is a fresh random roll. Prefer an opaque id over an email address: the key is part of the request URL. See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts).
- **Any other key** is an audience attribute, matched against the flag's [audience](/guides/audiences/) exactly and case-sensitively. An attribute you don't send never matches. `cohort`, `env` and `targetingKey` are reserved and cannot be audience attributes.

`UserContext` is a `map[string]string`, matching the query string it becomes. Convert numbers and booleans yourself, for example `strconv.Itoa(seats)` or `strconv.FormatBool(beta)`. With caching enabled, each distinct `targetingKey` is a separate cache entry.

#### Working with Group Flags (Environments)
Specify the environment in the `UserContext`:

```go
userContext := rocketflag.UserContext{"env": "production"}
flag, err := rf.GetFlag(ctx, flagKey, userContext)
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
	"context"
	"time"

	rocketflag "github.com/rocketflag/go-sdk/v2"
)

// Enable response caching with a 5-minute default TTL.
rf := rocketflag.NewClient(rocketflag.WithCache(5 * time.Minute))

// First call hits the API; subsequent calls within the TTL are served from cache.
flag, err := rf.GetFlag(ctx, "your-flag-id", rocketflag.UserContext{})
```

You can override the TTL for a single call — or disable caching for that call — with `WithCallTTL`:

```go
// Force a fresh fetch, bypassing the cache for this call.
flag, err := rf.GetFlag(ctx, "your-flag-id", nil, rocketflag.WithCallTTL(0))

// Use a shorter TTL just for this call.
flag, err := rf.GetFlag(ctx, "your-flag-id", nil, rocketflag.WithCallTTL(10*time.Second))
```

Caching is **opt-in** — without `WithCache` or a per-call override, every call goes directly to the API.

The cache holds at most 10,000 entries by default (`DefaultCacheMaxEntries`) and evicts the least recently used entry when full, preventing high-cardinality contexts (such as a `targetingKey` per user) from growing memory without bound. You can change this cap using `WithCacheMaxEntries`:

```go
rf := rocketflag.NewClient(
	rocketflag.WithCache(5 * time.Minute),
	rocketflag.WithCacheMaxEntries(50000),
)
```

### Migrating from v1

v2 introduces three breaking changes:

1. **Import path:** Import `github.com/rocketflag/go-sdk/v2` instead of `github.com/rocketflag/go-sdk`.
2. **Context parameter in `GetFlag`:** `GetFlag` takes a `context.Context` as its first argument (`rf.GetFlag(ctx, flagKey, userContext)`).
3. **`UserContext` is `map[string]string`:** Values are strings instead of `interface{}`. Convert numbers or booleans explicitly before passing them.

Additionally, caching is now bounded to 10,000 entries by default with LRU eviction.
