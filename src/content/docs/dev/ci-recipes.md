---
title: CI Recipes
description: Five copy-and-paste recipes for changing RocketFlag flags from GitHub Actions or any shell, using the Management API.
---

These recipes use the [Management API](/api/management/) to change flags from a pipeline. Each one is a GitHub Actions job and the same thing as a plain shell block, so it works in any CI system. They only need `curl` and `jq`, which ship on GitHub's runners.

### Before you start

1. On a Teams or Enterprise plan, create a token in the console under **Project > Tokens**. Give it `write` permission for the recipes that change flags, and limit it to the environments the pipeline should touch.
2. Store the secret as `ROCKETFLAG_TOKEN` in your CI secret store. In GitHub that is **Settings > Secrets and variables > Actions**.
3. Find the flag id in the console, or look it up by name: `GET /api/v1/flags?name=my-flag`.

The recipes assume a multi-environment project, so they pass `?env=production`. On a single-environment project, drop the `?env=` part. All of them read the token from `ROCKETFLAG_TOKEN` and use the flag id in `FLAG_ID`.

:::note
Every step sets `shell: bash`, which GitHub runs with `-eo pipefail`, and starts with `set -euo pipefail` so the same guarantee holds in any other shell. Without `pipefail`, a failed `curl` piped into `jq` would report `jq`'s success and the job would pass. With it, a non-2xx response from the API fails the step: `curl` exits 22, the pipeline takes that status, and `-e` stops the script.

A `PATCH` that changes nothing returns `"changed": false` and writes nothing, so every recipe here is safe to re-run.
:::

:::tip[Coming soon]
A composite action, `RocketFlag/flag-action@v1`, will wrap these calls so a step is one `uses:` line with the flag, environment and state as inputs. It is not published yet. Until then, the `curl` versions below are the supported way.
:::

---

### 1. Enable a flag after a deploy

Turn a flag on once the new version is live.

```yaml
jobs:
  enable-flag:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Enable new-checkout in production
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"enabled": true}' | jq '{changed, enabled: .flag.enabled}'
```

The same thing in a shell:

```bash
set -euo pipefail
export ROCKETFLAG_TOKEN="rf_..."
FLAG_ID="Gp9rS5dH1jXe6UaM0fTw"

curl -sS --fail-with-body -X PATCH \
  "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}' | jq '{changed, enabled: .flag.enabled}'
```

`--fail-with-body` makes `curl` exit non-zero (status 22) on a 4xx or 5xx while still printing the error envelope, and `set -euo pipefail` makes the shell honour that status even though `curl` is piped into `jq`, so the job fails and the log says why.

---

### 2. Ramp up: 50% then 100%

Two jobs, with your own health check in between. The second job only runs if the first, and the checks after it, pass.

```yaml
jobs:
  ramp-50:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Roll out to 50%
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"enabled": true, "trafficPercentage": 50}' | jq .flag

  verify:
    runs-on: ubuntu-latest
    needs: ramp-50
    steps:
      - run: ./scripts/check-error-rate.sh   # your own check

  ramp-100:
    runs-on: ubuntu-latest
    needs: verify
    steps:
      - name: Roll out to 100%
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"trafficPercentage": 100}' | jq .flag
```

In a shell:

```bash
set -euo pipefail
patch() {
  curl -sS --fail-with-body -X PATCH \
    "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
    -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$1" | jq .flag
}

patch '{"enabled": true, "trafficPercentage": 50}'
./scripts/check-error-rate.sh && patch '{"trafficPercentage": 100}'
```

Percentage rollouts are sticky per user when your app sends a `targetingKey`, so users who were in at 50% stay in at 100%.

---

### 3. Kill switch on a failed smoke test

If the post-deploy smoke test fails, switch the flag off. The `if: failure()` step runs only when an earlier step failed.

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Enable new-checkout
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"enabled": true}' > /dev/null

      - name: Smoke test
        run: ./scripts/smoke-test.sh

      - name: Kill switch
        if: failure()
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"enabled": false}' | jq '{changed, enabled: .flag.enabled}'
```

In a shell:

```bash
set -euo pipefail
off() {
  curl -sS --fail-with-body -X PATCH \
    "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
    -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"enabled": false}' | jq '{changed, enabled: .flag.enabled}'
}

./scripts/smoke-test.sh || { off; exit 1; }
```

---

### 4. Gate a step on flag state

Read the flag and only run a step when it is on, for example to run an expensive integration suite only while a feature is live. This needs only a `read` token.

```yaml
jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - name: Read flag state
        id: flag
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          enabled=$(curl -sS --fail-with-body \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" | jq -r '.enabled')
          echo "enabled=$enabled" >> "$GITHUB_OUTPUT"

      - name: New checkout tests
        if: steps.flag.outputs.enabled == 'true'
        run: npm run test:new-checkout
```

In a shell:

```bash
set -euo pipefail
enabled=$(curl -sS --fail-with-body \
  "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" | jq -r '.enabled')

if [ "$enabled" = "true" ]; then
  npm run test:new-checkout
fi
```

---

### 5. Sync a cohort list from a file

Keep a flag's cohorts in version control. One cohort per line in `cohorts.txt`, and the pipeline makes the flag match it. `jq` turns the file into the JSON array.

```text
beta-testers
qa-team
internal-staff
```

```yaml
on:
  push:
    branches: [main]
    paths: [cohorts.txt]

jobs:
  sync-cohorts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync cohorts
        env:
          ROCKETFLAG_TOKEN: ${{ secrets.ROCKETFLAG_TOKEN }}
          FLAG_ID: Gp9rS5dH1jXe6UaM0fTw
        shell: bash
        run: |
          set -euo pipefail
          body=$(jq -Rn '{cohorts: [inputs | select(length > 0)]}' cohorts.txt)
          curl -sS --fail-with-body -X PATCH \
            "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
            -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$body" | jq '{changed, cohorts: .flag.cohorts}'
```

In a shell:

```bash
set -euo pipefail
body=$(jq -Rn '{cohorts: [inputs | select(length > 0)]}' cohorts.txt)

curl -sS --fail-with-body -X PATCH \
  "https://api.rocketflag.app/api/v1/flags/$FLAG_ID?env=production" \
  -H "Authorization: Bearer $ROCKETFLAG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$body" | jq '{changed, cohorts: .flag.cohorts}'
```

A `cohorts` array replaces the list, it does not append, so the file is the single source of truth. On a multi-environment project, `cohorts` sets that environment's override. An empty file removes the override, and the environment inherits the flag-wide list (see [Patch](/api/management/#patch)). On a single-environment project, an empty file clears the list. Guard against an empty file if a missing file would be a mistake.

---

### Tips

- **Fail loudly.** Keep `--fail-with-body` together with `set -euo pipefail` (or `shell: bash` in GitHub Actions). The error envelope's `detail` tells you what to fix.
- **Check the token first.** `curl -sS -H "Authorization: Bearer $ROCKETFLAG_TOKEN" https://api.rocketflag.app/api/v1/token | jq` prints the token's permission, environments and expiry.
- **Never echo the secret.** GitHub masks `secrets.ROCKETFLAG_TOKEN` in logs, but other CI systems may not. Do not run scripts with `set -x` while the token is in the environment.
- **Denials send emails.** If a pipeline uses a token outside its permission or environments, the token's creator and the organisation's Owners are emailed, at most once per token per 24 hours. See [Security](/api/management/#security).
