---
title: CLI & MCP Server
description: Manage and evaluate RocketFlag feature flags from your terminal, CI pipelines, and AI coding assistants with the RocketFlag CLI and Model Context Protocol (MCP) server.
---

The RocketFlag CLI (`@rocketflag/cli`) and hosted Model Context Protocol (MCP) server (`https://api.rocketflag.app/mcp/v1`) let you inspect, create, toggle, and evaluate feature flags directly from your terminal, CI workflows, or AI coding assistants such as Claude Code, Cursor, and Antigravity.

The CLI is built on the [Management API](/api/management/) (`/api/v1`) and the public [Evaluation API](/dev/api-reference/) (`/v1`), and requires Node.js 22 or newer. The CLI supports browser-based authentication directly with your RocketFlag account (`rfu_...` user CLI sessions), which works on **every plan (including Free)** without creating an API token. For CI/CD and automated pipelines, it also accepts standard `rf_...` project API tokens created in the console under **Project > Tokens**. The hosted MCP endpoint runs on the RocketFlag management plane over Streamable HTTP (`https://api.rocketflag.app/mcp/v1`) and authenticates with `rf_...` project API tokens.

:::note[Plan availability]
Browser-authenticated CLI sessions (`rocketflag login`) and flag evaluation (`flags eval`) work across **every plan (including Free)**. Project API tokens (`rf_...`) and the hosted MCP endpoint (`/mcp/v1`) require an organisation on the **Teams or Enterprise plan** (or an active Teams trial).
:::

---

## First flag in 2 minutes

:::tip[New to the CLI?]
For an interactive, step-by-step walkthrough of how the CLI maps to your existing RocketFlag projects and environments, see [Getting Started with the CLI](/dev/cli-getting-started/).
:::

Install the CLI globally (`npm install -g @rocketflag/cli`, or prefix commands with `npx @rocketflag/cli`), and run these five commands:

```bash
# Install globally so `rocketflag` is on your PATH
npm install -g @rocketflag/cli

# 1. Authenticate with your RocketFlag account (opens browser on any plan, or pass a token)
rocketflag login

# 2. Initialise .rocketflag.json in your repository (stores projectId and defaultEnv)
rocketflag init

# 3. Create a new flag enabled at 100% rollout in your default environment (returns the new flag ID, e.g. Zt4nQ8wK2mVx7LpB3hYc)
rocketflag flags create checkout_v2 --enabled

# 4. Toggle the flag on or off (pass <flag_id> from the create output above)
rocketflag flags toggle <flag_id>

# 5. Evaluate the flag via the public Evaluation API
rocketflag flags eval <flag_id>
```

Every command supports `--json` for machine-readable output in scripts and CI pipelines.

---

## Configuration and precedence

The CLI separates user credentials from repository configuration so you can safely commit your project defaults without exposing secrets.

### Credential resolution precedence

The CLI resolves your bearer credential in the following order (highest to lowest priority):

1. `--token <secret>` command-line flag (accepts `rf_...` project token or `rfu_...` user session)
2. `ROCKETFLAG_TOKEN` environment variable
3. Saved credential in `~/.config/rocketflag/config.json` (or `$XDG_CONFIG_HOME/rocketflag/config.json`, written by `rocketflag login` with `0600` file permissions)

### Environment resolution precedence

On multi-environment projects, commands that target a single environment (`flags get`, `flags create` with initial state, `flags toggle`, and `flags eval`) resolve the environment in the following order:

1. `--env <name>` command-line flag
2. `ROCKETFLAG_ENV` environment variable
3. `defaultEnv` in the nearest `.rocketflag.json` (searched from the current working directory up to the filesystem root)

```json
{
  "projectId": "Pj2cV8yN4bRk7ZsD1qXm",
  "defaultEnv": "staging"
}
```

On single-environment projects, `.rocketflag.json` stores only `projectId`, and passing `--env` returns exit code `2` with a message explaining that the project does not use environments.

### API base URL precedence

1. `--api-url <url>` command-line flag
2. `ROCKETFLAG_API_URL` environment variable
3. `apiUrl` in `~/.config/rocketflag/config.json`
4. `https://api.rocketflag.app` (default)

---

## CLI command reference

### `rocketflag login`

Authenticates the CLI and saves your credentials to `~/.config/rocketflag/config.json` with `0700` directory and `0600` file permissions.

```bash
# Browser-based login (recommended for local development, works on all plans)
rocketflag login

# Authenticate directly with a project API token (ideal for CI/CD)
rocketflag login --token rf_your_token_here
```

In an interactive terminal, running `rocketflag login` without arguments opens your browser to sign in to RocketFlag and creates a 7-day user CLI session (`rfu_...`). Browser sessions work across every plan (including Free) and attribute actions to your user account in the audit log. You can review and revoke active CLI sessions in the console under **My Account > CLI Sessions**.

When `--token` or `ROCKETFLAG_TOKEN` is provided (or in non-interactive environments), the CLI validates the credential against `GET /api/v1/token` before saving it to disk. If a token is restricted to environments that have been deleted or renamed on the project, the CLI prints a stale-environment warning.

### `rocketflag whoami`

Displays the active credential's details.

```bash
rocketflag whoami
rocketflag whoami --json
```

- **For browser-authenticated user sessions (`rfu_...`):** Displays your name, email, device name, session expiry, and when run inside an initialised repository (or with `--project`), the target project and effective permission.
- **For project API tokens (`rf_...`):** Displays the token's name, ID, permission (`read` or `write`), project name and ID, project mode (`single-environment` or `multi-environment`), configured project environments, token-allowed environments, and expiry.

### `rocketflag init`

Writes `.rocketflag.json` in the current directory for the token's project.

```bash
rocketflag init
rocketflag init --env staging
```

- On a **single-environment project**, `init` writes `{ "projectId": "..." }`.
- On a **multi-environment project**, `init` intersects `project.environments` with the token's allowed `environments`. If only one environment is allowed, it selects it automatically; if multiple are allowed, it uses `--env`, `ROCKETFLAG_ENV`, or an interactive prompt in a TTY.

### `rocketflag flags list`

Lists all flags in the project, or filters to an exact flag name with `--name`.

```bash
rocketflag flags list
rocketflag flags list --name checkout_v2
rocketflag flags list --json
```

### `rocketflag flags get <id>`

Fetches a single flag by ID. On a multi-environment project, pass `--env` (or configure `defaultEnv` in `.rocketflag.json`) to project the flag to a flat state for that environment.

```bash
rocketflag flags get Zt4nQ8wK2mVx7LpB3hYc
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw --env staging
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw --env staging --json
```

### `rocketflag flags create <name>`

Creates a new flag in the project. Requires a `write` token. New flags default to `100%` rollout traffic unless `--percentage` is passed. On a multi-environment project, passing initial state options (`--enabled`, `--percentage`, `--cohort`, `--audience`) applies them only to the target environment (`--env`, `ROCKETFLAG_ENV`, or `defaultEnv` from `.rocketflag.json`), while all other environments start disabled (`off` at `100%` traffic).

```bash
rocketflag flags create checkout_v2 \
  --description "Redesigned checkout flow" \
  --tag checkout \
  --enabled \
  --percentage 50 \
  --cohort beta-testers \
  --audience k3j9x2m7q1pz \
  --env staging
```

| Option | Description |
| :--- | :--- |
| `--description <text>` | Optional human-readable description shown in the console. |
| `--tag <tag>` | Tag to attach to the flag (repeatable). |
| `--enabled` | Enable the flag immediately on creation (in the target/default environment on multi-environment projects). |
| `--percentage <0-100>` | Initial rollout traffic percentage (whole number from `0` to `100`, defaults to `100`). |
| `--cohort <cohort>` | Cohort identifier to attach (repeatable). |
| `--audience <id>` | Project audience ID to attach. |
| `--env <env>` | Target environment for the initial state on a multi-environment project (defaults to `ROCKETFLAG_ENV` or `defaultEnv` in `.rocketflag.json`). Other environments start disabled (`off` at `100%` traffic). |
| `--json` | Output the created flag as JSON. |

### `rocketflag flags update <id>`

Updates a flag's state (`enabled`, `trafficPercentage`, `cohorts`, or `audienceId`) via `PATCH /api/v1/flags/{id}`. Requires a `write` token. Only the fields you pass are updated; omitted fields stay unchanged. On a multi-environment project, an environment is required via `--env`, `ROCKETFLAG_ENV`, or `.rocketflag.json`.

```bash
# Enable a flag for a specific cohort at 50% traffic
rocketflag flags update Zt4nQ8wK2mVx7LpB3hYc \
  --on \
  --percentage 50 \
  --cohort user@example.com

# Clear cohorts or detach an audience
rocketflag flags update Zt4nQ8wK2mVx7LpB3hYc --clear-cohorts --clear-audience --json
```

| Option | Description |
| :--- | :--- |
| `--on` / `--off` | Explicitly enable or disable the flag. |
| `--percentage <0-100>` | Update rollout traffic percentage (`0` to `100`). |
| `--cohort <cohort>` | Replace the flag's cohort list (repeatable). |
| `--clear-cohorts` | Clear all cohorts from the flag (`[]`). |
| `--audience <id>` | Attach a project audience ID. |
| `--clear-audience` | Detach the currently attached audience (`null`). |
| `--env <env>` | Target environment on a multi-environment project. |
| `--json` | Output `{ changed, flag }` as JSON. |

### `rocketflag flags toggle <id>`

Flips a flag's `enabled` state (or sets it explicitly with `--on` or `--off`). Requires a `write` token. On a multi-environment project, an environment is required via `--env`, `ROCKETFLAG_ENV`, or `.rocketflag.json`.

```bash
# Invert the current enabled state
rocketflag flags toggle Zt4nQ8wK2mVx7LpB3hYc

# Explicitly enable or disable in a specific environment (idempotent in CI)
rocketflag flags toggle Gp9rS5dH1jXe6UaM0fTw --env production --on
rocketflag flags toggle Gp9rS5dH1jXe6UaM0fTw --env production --off --json
```

### `rocketflag flags eval <id>`

Evaluates whether a flag is enabled for a given context via the public Evaluation API (`GET /v1/flags/{id}`). Does not require a Management API token.

```bash
rocketflag flags eval Gp9rS5dH1jXe6UaM0fTw \
  --env staging \
  --cohort beta-testers \
  --key user_123 \
  --attr plan=pro \
  --attr country=AU
```

| Option | Description |
| :--- | :--- |
| `--env <env>` | Environment name (`[a-z0-9_-]{1,64}`). |
| `--cohort <cohort>` | Cohort value to evaluate against the flag's cohort list. |
| `--key <targetingKey>` | Stable identifier (such as a user ID) for sticky percentage rollouts. |
| `--attr <key=value>` | Custom attribute for [audience](/guides/audiences/) matching (repeatable). Values `true` and `false` are sent as booleans. |
| `--json` | Output the `{ id, name, enabled }` evaluation response as JSON. |

---

## JSON output and exit codes

Pass `--json` to any command to write structured JSON to `stdout` while keeping warnings and error messages on `stderr`.

The CLI uses deterministic exit codes so shell scripts and CI pipelines can branch reliably:

| Exit code | Constant | Meaning |
| :--- | :--- | :--- |
| `0` | `EXIT_OK` | Command succeeded. |
| `1` | `EXIT_ERROR` | Runtime, network, or unexpected API error (`404`, `429`, `5xx`). |
| `2` | `EXIT_USAGE` | Invalid CLI arguments, unknown command, missing `--env` on a multi-environment project, or passing `--env` on a single-environment project. |
| `3` | `EXIT_AUTH` | Authentication or authorisation failure: missing token, `401` invalid/expired/revoked token, or `403` read-only token or environment outside the token's scope. |

---

## MCP Server (`https://api.rocketflag.app/mcp/v1`)

RocketFlag hosts a stateless Streamable HTTP Model Context Protocol (MCP) endpoint on the management plane at `https://api.rocketflag.app/mcp/v1` so AI coding agents can inspect your project, create feature flags while wiring up code, and toggle flags in staging without leaving your editor. Because RocketFlag hosts the MCP endpoint directly on the management plane, no local Node.js or `npx` installation is required for MCP.

### Setup in Claude Code

Register the hosted HTTP MCP server with the `claude mcp add` command, passing your project API token in the `Authorization` header:

```bash
claude mcp add --transport http rocketflag https://api.rocketflag.app/mcp/v1 \
  --header "Authorization: Bearer rf_your_token_here"
```

### Setup in Cursor

Add a `rocketflag` server entry to `.cursor/mcp.json` in your project root (or `~/.cursor/mcp.json` globally):

```json
{
  "mcpServers": {
    "rocketflag": {
      "url": "https://api.rocketflag.app/mcp/v1",
      "headers": {
        "Authorization": "Bearer rf_your_token_here"
      }
    }
  }
}
```

### Setup in Antigravity

Register the server with the `agy` CLI (note: flags must come before `<name>`):

```bash
agy mcp add --header "Authorization: Bearer rf_your_token_here" rocketflag https://api.rocketflag.app/mcp/v1
```

Or add the server to your Antigravity `mcp_config.json`:

```json
{
  "mcpServers": {
    "rocketflag": {
      "serverUrl": "https://api.rocketflag.app/mcp/v1",
      "headers": {
        "Authorization": "Bearer rf_your_token_here"
      }
    }
  }
}
```

:::tip[Least-privilege tokens for AI agents]
Give your local coding agent a token scoped to your `development` or `staging` environment rather than `production`. If a tool call attempts to modify an environment outside the token's scope or write with a `read` token, the hosted MCP server returns an actionable suggestion explaining how to update the token under **Project > Tokens**.
:::

### Available MCP tools

The hosted MCP endpoint at `https://api.rocketflag.app/mcp/v1` registers six management-plane tools:

| Tool | Token permission | Inputs | What it does |
| :--- | :--- | :--- | :--- |
| `whoami` | `read` | *(none)* | Returns the token's permission, project ID and name, whether the project is single-environment or multi-environment, configured project environments, allowed token environments, and any stale environment warnings. Agents should call this first. |
| `list_flags` | `read` | `name?` (`string`) | Lists all flags in the project, or filters by exact flag name. |
| `get_flag` | `read` | `id` (`string`), `env?` (`string`) | Fetches a flag by ID, optionally projected to a single environment on multi-environment projects. |
| `create_flag` | `write` | `name` (`string`), `description?`, `tags?`, `enabled?`, `trafficPercentage?`, `cohorts?`, `audienceId?`, `environments?` | Creates a new flag. Uses top-level state fields on single-environment projects and an `environments` map on multi-environment projects. |
| `update_flag` | `write` | `id` (`string`), `env?` (`string`), `enabled?` (`boolean`), `trafficPercentage?` (`number`), `cohorts?` (`string[]`), `audienceId?` (`string \| null`) | Updates a flag's state (`enabled`, `trafficPercentage`, `cohorts`, or `audienceId`) and returns `{ changed, flag }`. Omitted fields stay unchanged; `cohorts: []` clears cohorts and `audienceId: null` detaches an audience. |
| `toggle_flag` | `write` | `id` (`string`), `env?` (`string`), `enabled?` (`boolean`) | Toggles a flag on or off (or sets `enabled` explicitly) and returns `{ id, name, environment, previous, current, changed, flag }`. Requires `env` on multi-environment projects. |
