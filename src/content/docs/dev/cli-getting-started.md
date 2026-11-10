---
title: Getting Started with the CLI
description: A step-by-step walkthrough of the RocketFlag CLI for existing RocketFlag users, from logging in with your browser and binding a repository to creating, toggling, and evaluating feature flags.
---

If you already use the RocketFlag console, this guide walks through how the `rocketflag` command-line interface maps to your existing projects, environments, and feature flags.

By the end, you will have signed in from your terminal, listed your projects, bound a repository to a project and default environment, inspected your existing flags, created and toggled a flag, and evaluated targeting rules from your shell.

:::note[Prerequisites]
- **Node.js 22 or newer**
- A RocketFlag account on **any plan** (Free, Pro, Teams, or Enterprise) with at least one project created in the [RocketFlag console](https://console.rocketflag.app).
:::

---

## Mental model: console to CLI

Three design choices anchor how the CLI works:

1. **Interactive user sessions (`rfu_...`) for local work, project API tokens (`rf_...`) for automation.**
   - When you run `rocketflag login` on your machine, you sign in through your browser and receive a 7-day user CLI session token (`rfu_...`). User sessions work on **every plan** (Free, Pro, Teams, and Enterprise), give you access to all of your personal and organisation projects, and attribute flag changes directly to your name and email in the audit log.
   - For CI/CD pipelines, headless automation, and the hosted MCP server (`https://api.rocketflag.app/mcp/v1`), you can create project-scoped API tokens (`rf_...`) in the console under **Project > Tokens** (available on the Teams and Enterprise plans).
2. **User credentials and repository config are kept separate.**
   - **Your credentials** are saved in `~/.config/rocketflag/config.json` with `0600` file permissions when you run `rocketflag login`, and removed when you run `rocketflag logout`.
   - **Your repository defaults** live in `.rocketflag.json` in your git repository when you run `rocketflag init`. It only ever stores `{ "projectId", "defaultEnv" }`, never tokens or secrets, so it is safe to commit.
3. **List by name, act by ID.** In RocketFlag, flag names are free text and SDKs evaluate flags by their immutable ID. `rocketflag flags list` shows both names and IDs (and can filter by `--name`), while point operations (`flags get`, `flags update`, `flags toggle`, and `flags eval`) take `<id>`.

---

## Step 0: Install or run `--help`

Install the CLI globally with `npm install -g @rocketflag/cli` so `rocketflag` is always on your `PATH` (or run individual commands with `npx @rocketflag/cli`):

```bash
npm install -g @rocketflag/cli
rocketflag --help
```

```text
rocketflag v1.2.0 - RocketFlag command-line interface

Usage:
  rocketflag <command> [options]

Commands:
  login                         Sign in via browser or save an API token to ~/.config/rocketflag/config.json
  logout                        Revoke active CLI session and remove saved credentials
  whoami                        Inspect active session or API token, permissions, and project environments
  projects list                 List projects accessible to the authenticated credential
  init                          Initialise .rocketflag.json in the current repository
  flags list [--name <exact>]   List feature flags in the project
  flags get <id> [--env <env>]  Fetch details for a feature flag
  flags create <name> [options] Create a new feature flag
  flags update <id> [options]   Update a feature flag's state, percentage, cohorts, or audience
  flags toggle <id> [options]   Toggle a feature flag on or off
  flags eval <id> [options]     Evaluate a feature flag via the public Evaluation API

Global options:
  --token <rf_...|rfu_...>      Override API token or user session token (or set ROCKETFLAG_TOKEN)
  --project <id>                Override target project ID (or set ROCKETFLAG_PROJECT)
  --env <name>                  Override target environment (or set ROCKETFLAG_ENV)
  --api-url <url>               Override API base URL (or set ROCKETFLAG_API_URL)
  --json                        Output machine-readable JSON
  -h, --help                    Show help
  -v, --version                 Show version
```

Every command and subcommand supports `--help` (for example, `rocketflag flags create --help`) and `--json` for machine-readable output.

---

## Step 1: Log in (`rocketflag login`)

Run `rocketflag login` in your terminal:

```bash
rocketflag login
```

By default, the CLI starts a temporary loopback listener on `127.0.0.1` and opens your browser to `https://console.rocketflag.app/cli/auth`. Sign in with your usual account (Google, GitHub, email magic link, or Enterprise SAML SSO) and click **Authorise CLI**. The console mints a 7-day `rfu_...` session token, hands it back to your terminal over localhost, and saves it to `~/.config/rocketflag/config.json`:

```text
Opening browser to authenticate...
Authenticated as Alex Rivera (alex@example.com).
Session: dev-laptop (Cs8kP2mV9xLq4NwR1tYz)
Expires: 2026-11-15T08:00:00.000Z
Saved credentials to /home/you/.config/rocketflag/config.json
```

**Other ways to log in:**
- **SSH, containers, or headless environments (`--no-browser`):** Run `rocketflag login --no-browser`. The CLI prints the authorisation URL (`https://console.rocketflag.app/cli/auth?device=...`) so you can open it in any browser, click **Authorise CLI**, copy the one-time `rfu_...` token, and paste it into the terminal prompt.
- **Project API tokens (`--token`):** For CI/CD or single-project automation on Teams and Enterprise plans, pass a project API token created under **Project > Tokens**: `rocketflag login --token rf_your_token_here` (or set `ROCKETFLAG_TOKEN` in your environment).

You can view and revoke active browser-authenticated CLI sessions at any time in the console under **My Account > CLI Sessions**, or by running `rocketflag logout`.

---

## Step 2: List your projects and bind your repository (`projects list` and `init`)

To see all personal and organisation projects your account can access, run `rocketflag projects list`:

```bash
rocketflag projects list
```

```text
ID                    NAME          ORGANISATION  ENVIRONMENTS     PERMISSION
Pj9xK3mV2pLq8NwR4tYz  Side Project  Personal      single-env       write
Pj2cV8yN4bRk7ZsD1qXm  Storefront    Acme Corp     dev, test, prod  write
```

:::note[Creating new projects]
Projects are created in the [RocketFlag console](https://console.rocketflag.app). The CLI lists and selects from your existing personal and organisation projects.
:::

Inside your application repository, run `rocketflag init` to bind the repo to a project and default environment:

```bash
rocketflag init
```

How `init` behaves depends on your account and project configuration:
- **Project selection (with a user session):** If your account has multiple projects, `init` prompts you to choose one interactively (or you can pass `rocketflag init --project Pj2cV8yN4bRk7ZsD1qXm`). If you only have one project (or you logged in with a single-project `rf_...` token), it selects that project automatically.
- **Environment selection:** On a multi-environment project, `init` prompts you to choose your default environment (`Select default environment (dev, test, prod): `) or accepts `rocketflag init --env dev`. On a single-environment project, it writes `{ "projectId": "..." }` directly.

```text
Available projects:
  1. Pj9xK3mV2pLq8NwR4tYz  Side Project (Personal)
  2. Pj2cV8yN4bRk7ZsD1qXm  Storefront (Acme Corp)
Select project (1-2 or project ID): 2
Select default environment (dev, test, prod): dev
Initialised RocketFlag project 'Storefront' (Pj2cV8yN4bRk7ZsD1qXm) with defaultEnv 'dev' in /path/to/repo/.rocketflag.json
```

Inspect the generated `.rocketflag.json`:

```json
{
  "projectId": "Pj2cV8yN4bRk7ZsD1qXm",
  "defaultEnv": "dev"
}
```

The CLI searches from your current working directory up to the filesystem root for `.rocketflag.json`. Commands run from any subfolder of your repository automatically target that project and default environment unless you override them with `--project` / `ROCKETFLAG_PROJECT` or `--env` / `ROCKETFLAG_ENV`.

---

## Step 3: Check your active context (`rocketflag whoami`)

Whenever you open a terminal and want to check which account, session, project, or permission level is active in the current directory, run `rocketflag whoami`:

```bash
rocketflag whoami
```

```text
Account: Alex Rivera (alex@example.com)
Session: dev-laptop (Cs8kP2mV9xLq4NwR1tYz)
Expiry: 2026-11-15T08:00:00.000Z
Project: Storefront (Pj2cV8yN4bRk7ZsD1qXm) [multi-environment]
Permission: write
Project environments: dev, test, prod
```

If you are logged in with a project API token (`rf_...`), `whoami` instead shows the token's name, ID, project, and any environment restrictions configured on that token.

---

## Step 4: Inspect existing flags (`flags list` and `flags get`)

List all flags in the project:

```bash
rocketflag flags list
```

```text
ID                    NAME          KIND        STATE / ENVIRONMENTS
Gp9rS5dH1jXe6UaM0fTw  checkout_v2   groupflag   dev:on(100%), test:off(100%), prod:off(100%)
```

- Filter to an exact flag name with `rocketflag flags list --name checkout_v2`.
- Target a different project without changing `.rocketflag.json` by passing `--project <id>`.

To inspect a single flag in detail, pass its `<id>` to `rocketflag flags get`:

```bash
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw
```

Because `.rocketflag.json` defines `"defaultEnv": "dev"`, `flags get` automatically projects the flag to its state in `dev`:

```text
ID: Gp9rS5dH1jXe6UaM0fTw
Name: checkout_v2
Kind: groupflag
Environment: dev
Enabled: true
Traffic percentage: 100%
Cohorts: none
Audience ID: none
```

Pass `--env test` to inspect another environment, or `--json` for the raw JSON object:

```bash
rocketflag flags get Gp9rS5dH1jXe6UaM0fTw --env test --json
```

---

## Step 5: Create a flag (`flags create`)

Create a new feature flag from your terminal with `rocketflag flags create <name>`:

```bash
rocketflag flags create new_billing_banner \
  --description "Annual billing promotion in header" \
  --tag billing \
  --enabled
```

```text
Created flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF).
ID: JlBvxKerlbE6mdIEGnbF
Name: new_billing_banner
Kind: groupflag
Environments:
  dev: enabled=true, traffic=100%, cohorts=none, audience=none
  test: enabled=false, traffic=100%, cohorts=none, audience=none
  prod: enabled=false, traffic=100%, cohorts=none, audience=none
```

Two important details to note on creation:
1. **Default rollout is `100%`.** Just like in the console, new flags default to `100%` rollout traffic in every environment so that enabling or toggling a flag turns it on for all traffic unless you explicitly pass `--percentage <0-100>`.
2. **Initial state applies only to your target environment.** On a multi-environment project, passing `--enabled` (or `--percentage`, `--cohort`, `--audience`) applies those settings **only** to your default environment (`dev` from `.rocketflag.json`, or whatever you pass to `--env`). Every other environment starts safely disabled (`enabled=false, traffic=100%`).

---

## Step 6: Toggle a flag (`flags toggle`)

Use the flag ID returned by `create` (or `list`) to toggle the flag on or off:

```bash
# Invert the current state in your default environment (dev)
rocketflag flags toggle JlBvxKerlbE6mdIEGnbF
```

```text
Flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF) [dev]: on -> off
```

For scripts and CI pipelines where you want idempotent state changes rather than a flip, pass `--on` or `--off`:

```bash
rocketflag flags toggle JlBvxKerlbE6mdIEGnbF --off
```

```text
Flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF) [dev]: off -> off (unchanged)
```

To toggle a flag in a different environment, pass `--env`:

```bash
rocketflag flags toggle JlBvxKerlbE6mdIEGnbF --env test --on
```

```text
Flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF) [test]: off -> on
```

When you toggle or create flags with a user session (`rfu_...`), the change is recorded under your user email and name in the project's audit log.

---

## Step 7: Evaluate a flag (`flags eval`)

`rocketflag flags eval <id>` calls the public [Evaluation API](/dev/api-reference/) (`GET /v1/flags/{id}`), the exact same unauthenticated endpoint your application SDKs call:

```bash
# Evaluate in your default environment (dev, where we toggled it off)
rocketflag flags eval JlBvxKerlbE6mdIEGnbF
```

```text
Flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF): false (disabled)
```

```bash
# Evaluate in test (where we toggled it on)
rocketflag flags eval JlBvxKerlbE6mdIEGnbF --env test
```

```text
Flag 'new_billing_banner' (JlBvxKerlbE6mdIEGnbF): true (enabled)
```

You can also test cohort overrides, sticky rollout keys, and [audience](/guides/audiences/) attributes straight from the command line:

```bash
rocketflag flags eval JlBvxKerlbE6mdIEGnbF \
  --env test \
  --cohort beta-testers \
  --key user_123 \
  --attr plan=teams \
  --attr beta=true
```

---

## Step 8: Log out (`rocketflag logout`)

When you are finished on a shared machine or want to end your 7-day CLI session early, run `rocketflag logout`:

```bash
rocketflag logout
```

```text
Logged out and removed saved credentials.
```

`logout` revokes the active `rfu_...` session on the server and deletes `~/.config/rocketflag/config.json`.

---

## Next steps

- **[CLI & MCP Server Reference](/dev/cli-and-mcp/):** Full option tables, project and environment variable precedence, user sessions vs project API tokens, exit codes (`0`, `1`, `2`, `3`), and AI coding agent setup (`https://api.rocketflag.app/mcp/v1`).
- **[CI Recipes](/dev/ci-recipes/):** Copy-and-paste GitHub Actions and shell workflows for post-deploy flag toggles, staged rollouts, and kill switches.
- **[Management API](/api/management/):** Underlying `/api/v1` HTTP endpoints, dual-principal authentication, merge patch semantics, and rate limits.
