---
title: CLI & MCP Server
description: Manage and evaluate RocketFlag feature flags from your terminal, CI pipelines, and AI coding assistants with the RocketFlag CLI and Model Context Protocol (MCP) server.
---

The RocketFlag CLI (`@rocketflag/cli`) and hosted Model Context Protocol (MCP) server (`https://api.rocketflag.app/mcp/v1`) let you inspect, create, toggle, and evaluate feature flags directly from your terminal, CI workflows, or AI coding assistants such as Claude Code, Cursor, and Antigravity.

The CLI is built on the [Management API](/api/management/) (`/api/v1`) and the public [Evaluation API](/dev/api-reference/) (`/v1`), and requires Node.js 22 or newer. The hosted MCP endpoint runs on the RocketFlag management plane over Streamable HTTP (`https://api.rocketflag.app/mcp/v1`), so no local Node.js or `npx` installation is required for MCP.

:::note[Plan availability]
- **Interactive CLI login (`rocketflag login`)** and `flags eval` work on **every plan** (Free, Pro, Teams, and Enterprise), across both personal and organisation projects.
- **Project API tokens (`rf_...`)** and the **hosted MCP endpoint (`/mcp/v1`)** require an organisation on the **Teams or Enterprise plan** (or an active Teams trial).
:::

---

## First flag in 2 minutes

:::tip[New to the CLI?]
For an interactive, step-by-step walkthrough of how the CLI maps to your existing RocketFlag projects and environments, see [Getting Started with the CLI](/dev/cli-getting-started/).
:::

Install the CLI globally (`npm install -g @rocketflag/cli`, or prefix commands with `npx @rocketflag/cli`), sign in with your browser, and run these five commands:

```bash
# Install globally so `rocketflag` is on your PATH
npm install -g @rocketflag/cli

# 1. Sign in via your browser (saves a 7-day rfu_... session to ~/.config/rocketflag/config.json)
rocketflag login

# 2. Pick your project and default environment in .rocketflag.json
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

## User CLI sessions vs project API tokens

The CLI and Management API support two credential types so you can use interactive browser login on your laptop and scoped tokens in automation:

| Feature | User CLI sessions (`rfu_...`) | Project API tokens (`rf_...`) |
| :--- | :--- | :--- |
| **Best for** | Local developer terminals (interactive workflows) | CI/CD pipelines, headless automation, and the hosted MCP server (`/mcp/v1`) |
| **Plan availability** | **Every plan** (Free, Pro, Teams, and Enterprise) | **Teams and Enterprise plans** (or an active Teams trial) |
| **How to create** | Run `rocketflag login` (or `rocketflag login --no-browser`) | Create in the console under **Project > Tokens** |
| **Project scope** | All personal and organisation projects your account can access (selected via `--project`, `ROCKETFLAG_PROJECT`, or `.rocketflag.json`) | Bound to a **single organisation project** |
| **Environment scope** | All environments on the selected project | All project environments, or restricted to specific environments (for example, `staging` only) |
| **Permissions** | Follows your role on the project (`write` for owners, collaborators, Editors, and Admins; `read` for Viewers) | Explicit `read` or `write` chosen when creating the token |
| **Expiry** | **7 days** from sign-in | Configurable: Never, 30 days, 90 days, or up to 365 days |
| **Audit log attribution** | Your user email and display name | `token:<id>` and the token's name |
| **Where to manage / revoke** | **My Account > CLI Sessions** in the console, or `rocketflag logout` | **Project > Tokens** in the console |

---

## Configuration and precedence

The CLI separates user credentials from repository configuration so you can safely commit your project defaults without exposing secrets.

### Token resolution precedence

The CLI resolves your bearer credential (`rfu_...` user session token or `rf_...` project API token) in the following order (highest to lowest priority):

1. `--token <rf_...|rfu_...>` command-line flag
2. `ROCKETFLAG_TOKEN` environment variable
3. `~/.config/rocketflag/config.json` (or `$XDG_CONFIG_HOME/rocketflag/config.json`, written by `rocketflag login` with `0600` file permissions)

### Project resolution precedence

When authenticated with a user CLI session (`rfu_...`), commands that operate on a project (`whoami`, `init`, `flags list`, `flags get`, `flags create`, `flags update`, and `flags toggle`) resolve the target project ID in the following order:

1. `--project <id>` command-line flag
2. `ROCKETFLAG_PROJECT` environment variable
3. `projectId` in the nearest `.rocketflag.json` (searched from the current working directory up to the filesystem root)

When authenticated with a project API token (`rf_...`), the token is already bound to a single project, so `--project` is not required (passing a conflicting `--project` ID returns an error).

### Environment resolution precedence

On multi-environment projects, commands that target a single environment (`flags get`, `flags create` with initial state, `flags update`, `flags toggle`, and `flags eval`) resolve the environment in the following order:

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

### API and console URL precedence

1. `--api-url <url>` / `--console-url <url>` command-line flags
2. `ROCKETFLAG_API_URL` / `ROCKETFLAG_CONSOLE_URL` environment variables
3. `apiUrl` in `~/.config/rocketflag/config.json`
4. `https://api.rocketflag.app` and `https://console.rocketflag.app` (defaults)

---

## CLI command reference

### `rocketflag login`

Authenticates the CLI and saves your credential to `~/.config/rocketflag/config.json` with `0700` directory and `0600` file permissions.

```bash
# Interactive browser sign-in (default, works on Free, Pro, Teams, and Enterprise)
rocketflag login

# Manual sign-in for SSH, remote dev boxes, or containers without a local browser
rocketflag login --no-browser

# Direct token login (project API token rf_... or user session token rfu_...)
rocketflag login --token rf_your_token_here
```

`rocketflag login` supports three modes:

1. **Interactive browser sign-in (default):** Starts a temporary HTTP server on `127.0.0.1` (`127.0.0.1:0` with a random `state` nonce) and opens `https://console.rocketflag.app/cli/auth` in your default browser. After you sign in and click **Authorise CLI**, the console mints a 7-day `rfu_...` user session token and redirects back to `http://127.0.0.1:<port>/callback`.
2. **Manual browser sign-in (`--no-browser`):** Prints the authorisation URL (`https://console.rocketflag.app/cli/auth?device=<hostname>`) without starting a loopback server. Open the URL on any machine, click **Authorise CLI**, copy the one-time `rfu_...` token displayed in the console, and paste it into the masked CLI prompt.
3. **Direct token (`--token <rf_...|rfu_...>` or `ROCKETFLAG_TOKEN`):** Skips the browser flow, validates the token directly against `GET /api/v1/token`, and saves it to `~/.config/rocketflag/config.json`. If a project token is restricted to environments that have been deleted or renamed on the project, the CLI prints a stale-environment warning.

| Option | Description |
| :--- | :--- |
| `--token <rf_...\|rfu_...>` | Validate and save a project API token or user session token directly. |
| `--no-browser` | Use manual copy-and-paste login instead of a `127.0.0.1` loopback redirect (ideal for SSH and containers). |
| `--device-name <name>` | Custom device label shown under **My Account > CLI Sessions** (defaults to your hostname). |
| `--console-url <url>` | Override the RocketFlag console URL (or set `ROCKETFLAG_CONSOLE_URL`). |
| `--api-url <url>` | Override the Management API URL (or set `ROCKETFLAG_API_URL`). |
| `--json` | Output the login result as JSON. |

### `rocketflag logout`

Revokes the active `rfu_...` user CLI session via `POST /api/v1/session/revoke` (best-effort) and deletes `~/.config/rocketflag/config.json`.

```bash
rocketflag logout
rocketflag logout --json
```

You can also view and revoke active CLI sessions from the console under **My Account > CLI Sessions**.

### `rocketflag projects list`

Lists all personal, shared personal, and organisation projects accessible to your credential via `GET /api/v1/projects`.

```bash
rocketflag projects list
rocketflag projects list --json
```

```text
ID                    NAME          ORGANISATION  ENVIRONMENTS     PERMISSION
Pj9xK3mV2pLq8NwR4tYz  Side Project  Personal      single-env       write
Pj2cV8yN4bRk7ZsD1qXm  Storefront    Acme Corp     dev, test, prod  write
```

When called with a project API token (`rf_...`), `projects list` returns the single project that token belongs to. Note that new projects are created in the [RocketFlag console](https://console.rocketflag.app), not from the CLI.

### `rocketflag whoami`

Displays the active credential's details and project context.

```bash
rocketflag whoami
rocketflag whoami --project Pj2cV8yN4bRk7ZsD1qXm
rocketflag whoami --json
```

- **With a user CLI session (`rfu_...`):** Shows your account name and email, session device name and ID, 7-day expiry timestamp, and (when a project is selected via `--project`, `ROCKETFLAG_PROJECT`, or `.rocketflag.json`) the resolved project name, ID, mode, permission (`read` or `write`), and configured environments.
- **With a project API token (`rf_...`):** Shows the token's name, ID, permission (`read` or `write`), project name and ID, project mode (`single-environment` or `multi-environment`), configured project environments, token-allowed environments, and expiry.

### `rocketflag init`

Writes `.rocketflag.json` in the current directory to bind your repository to a project and default environment.

```bash
rocketflag init
rocketflag init --project Pj2cV8yN4bRk7ZsD1qXm --env staging
```

- **With a user CLI session (`rfu_...`):** Fetches your accessible projects via `GET /api/v1/projects`. If `--project` or `ROCKETFLAG_PROJECT` is provided, it uses that project; if your account has a single project, it selects it automatically; if you have multiple projects, it prompts you interactively to pick one in a TTY.
- **With a project API token (`rf_...`):** Uses the token's bound project automatically.
- **Environment selection:** On a single-environment project, `init` writes `{ "projectId": "..." }`. On a multi-environment project, if multiple environments are available, it uses `--env`, `ROCKETFLAG_ENV`, or an interactive prompt to write `{ "projectId": "...", "defaultEnv": "..." }`.

### `rocketflag flags list`

Lists all flags in the target project, or filters to an exact flag name with `--name`.

```bash
rocketflag flags list
rocketflag flags list --name checkout_v2
rocketflag flags list --project Pj2cV8yN4bRk7ZsD1qXm --json
```

### `rocketflag flags get <id>`

Fetches a single flag by ID. On a multi-environment project, pass `--env` (or configure `defaultEnv` in `.rocketflag.json`) to project the flag to a flat state for that environment.

```bash
rocketflag flags get Zt4nQ8wK2mVx7LpB3hYc
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw --env staging
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw --env staging --json
```

### `rocketflag flags create <name>`

Creates a new flag in the project. Requires `write` permission on the project. New flags default to `100%` rollout traffic unless `--percentage` is passed. On a multi-environment project, passing initial state options (`--enabled`, `--percentage`, `--cohort`, `--audience`) applies them only to the target environment (`--env`, `ROCKETFLAG_ENV`, or `defaultEnv` from `.rocketflag.json`), while all other environments start disabled (`off` at `100%` traffic).

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
| `--audience <id>` | Project audience ID to attach (requires a Teams or Enterprise project). |
| `--project <id>` | Override target project ID (or set `ROCKETFLAG_PROJECT`). |
| `--env <env>` | Target environment for the initial state on a multi-environment project (defaults to `ROCKETFLAG_ENV` or `defaultEnv` in `.rocketflag.json`). Other environments start disabled (`off` at `100%` traffic). |
| `--json` | Output the created flag as JSON. |

### `rocketflag flags update <id>`

Updates a flag's state (`enabled`, `trafficPercentage`, `cohorts`, or `audienceId`) via `PATCH /api/v1/flags/{id}`. Requires `write` permission on the project. Only the fields you pass are updated; omitted fields stay unchanged. On a multi-environment project, an environment is required via `--env`, `ROCKETFLAG_ENV`, or `.rocketflag.json`.

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
| `--audience <id>` | Attach a project audience ID (requires a Teams or Enterprise project). |
| `--clear-audience` | Detach the currently attached audience (`null`). |
| `--project <id>` | Override target project ID (or set `ROCKETFLAG_PROJECT`). |
| `--env <env>` | Target environment on a multi-environment project. |
| `--json` | Output `{ changed, flag }` as JSON. |

### `rocketflag flags toggle <id>`

Flips a flag's `enabled` state (or sets it explicitly with `--on` or `--off`). Requires `write` permission on the project. On a multi-environment project, an environment is required via `--env`, `ROCKETFLAG_ENV`, or `.rocketflag.json`.

```bash
# Invert the current enabled state
rocketflag flags toggle Zt4nQ8wK2mVx7LpB3hYc

# Explicitly enable or disable in a specific environment (idempotent in CI)
rocketflag flags toggle Gp9rS5dH1jXe6UaM0fTw --env production --on
rocketflag flags toggle Gp9rS5dH1jXe6UaM0fTw --env production --off --json
```

### `rocketflag flags eval <id>`

Evaluates whether a flag is enabled for a given context via the public Evaluation API (`GET /v1/flags/{id}`). Does not require a Management API token or CLI login.

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
| `2` | `EXIT_USAGE` | Invalid CLI arguments, unknown command, missing project selection with a user session, missing `--env` on a multi-environment project, or passing `--env` on a single-environment project. |
| `3` | `EXIT_AUTH` | Authentication or authorisation failure: missing token, `401` invalid/expired/revoked token or session, or `403` read-only access or environment outside a project token's scope. |

---

## MCP Server (`https://api.rocketflag.app/mcp/v1`)

RocketFlag hosts a stateless Streamable HTTP Model Context Protocol (MCP) endpoint on the management plane at `https://api.rocketflag.app/mcp/v1` so AI coding agents can inspect your project, create feature flags while wiring up code, and toggle flags in staging without leaving your editor. Because RocketFlag hosts the MCP endpoint directly on the management plane, no local Node.js or `npx` installation is required for MCP.

The hosted MCP endpoint authenticates with a project API token (`rf_...`) created in the console under **Project > Tokens** (available on the Teams and Enterprise plans).

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
