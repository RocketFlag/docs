---
title: Python SDK
description: Using the RocketFlag SDK in your Python applications (beta).
---

:::caution[Beta]
The Python SDK is in **beta**. The evaluation API matches the Node and Go SDKs, but APIs, packaging, and docs may still change. Prefer pinning a version in production.
:::

The RocketFlag Python SDK is a stdlib-only client for evaluating flags from Python 3.9+ applications.

### Installation

```bash
pip install rocketflag
```

### Basic Usage

```python
from rocketflag import create_client

rocketflag = create_client()

flag = rocketflag.get_flag("ABC123def456")
if flag.enabled:
    print(f'Feature "{flag.name}" is enabled!')
```

You can also construct `Client` directly:

```python
from rocketflag import Client

client = Client()
flag = client.get_flag("ABC123def456")
```

### Advanced Usage

#### Working with Cohorts

Pass a cohort identifier to target specific users:

```python
flag = rocketflag.get_flag("ABC123def456", {"cohort": "user@example.com"})
```

#### Attributes and sticky rollouts

Add a `targetingKey` for sticky percentage rollouts, and any other keys as audience attributes:

```python
flag = rocketflag.get_flag(
    "ABC123def456",
    {"targetingKey": "user-42", "plan": "pro", "country": "AU"},
)
```

Percentage rollouts are sticky per key: the same `targetingKey` (or, without one, the same `cohort`) gets the same answer every time, so send a stable user identifier. Other keys are matched against the flag's [audience](/guides/audiences/) and are only read when the flag has one. Matching is exact and case-sensitive, and an attribute you do not send never matches. `cohort`, `env` and `targetingKey` are reserved and cannot be audience attributes. No SDK signature changed: this is the same context you already pass. See [Sticky rollouts](/guides/feature-flags/#sticky-rollouts). With caching on, each distinct `targetingKey` is a separate cache entry.

#### Working with Group Flags (Environments)

When using Group Flags, specify the environment (`env` must be alphanumeric):

```python
flag = rocketflag.get_flag("ABC123def456", {"env": "production"})
```

### Custom Configuration

```python
rocketflag = create_client("v1", "https://your-custom-proxy.com")
```

### Caching Responses

Opt-in in-memory cache keyed by flag ID **and** user context:

```python
# Cache flag responses for 5 minutes.
rocketflag = create_client(ttl_seconds=300)

flag = rocketflag.get_flag("ABC123def456", {"cohort": "beta"})

# Force a fresh fetch.
flag = rocketflag.get_flag("ABC123def456", ttl_seconds=0)
```

Without a client default or per-call TTL, every call hits the API.

### Error Handling

```python
from rocketflag import APIError, InvalidResponseError, NetworkError, create_client

rocketflag = create_client()

try:
    flag = rocketflag.get_flag("ABC123def456")
except APIError as err:
    print(f"API Error: {err.status} {err.status_text}")
except InvalidResponseError as err:
    print(f"Invalid Response Error: {err}")
except NetworkError as err:
    print(f"Network Error: {err}")
```

- `APIError` — non-OK HTTP status (includes `status` / `status_text`). A `404` means the flag ID is unknown.
- `InvalidResponseError` — body is not JSON or not a flag object.
- `NetworkError` — connection failure.

### Source

- GitHub: [RocketFlag/python-sdk](https://github.com/RocketFlag/python-sdk)
- PyPI: [rocketflag](https://pypi.org/project/rocketflag/)
