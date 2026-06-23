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

#### Working with Group Flags (Environments)
Specify the environment in the `UserContext`:

```go
userContext := rocketflag.UserContext{"env": "production"}
flag, err := rf.GetFlag(flagKey, userContext)
```

#### Protected Keys
Add the "key" to your `UserContext`:

```go
userContext := rocketflag.UserContext{"key": "YOUR_PROTECTED_KEY"}
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

To avoid hitting the API on every check, enable an in-memory cache by configuring the client with the `WithCache` functional option. Cached entries are keyed by flag ID **and** the user context, so different cohorts or environments still resolve independently.

```go
import (
	"time"
	rocketflag "github.com/rocketflag/go-sdk"
)

// Enable response caching with a 5-minute TTL
rf := rocketflag.NewClient(
	// <!-- TODO: verify if the functional option is rocketflag.WithCache or rocketflag.WithCaching, and the exact signature -->
	rocketflag.WithCache(5 * time.Minute),
)
```

Caching is **opt-in** — without configuring a cache TTL, every call goes directly to the API.
