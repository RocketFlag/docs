---
title: Getting Started with the CLI
description: A step-by-step walkthrough of the RocketFlag CLI for existing RocketFlag users, from logging in and binding a repository to creating, toggling, and evaluating feature flags.
---

If you already use the RocketFlag console, this guide walks through how the `rocketflag` command-line interface maps to your existing projects, environments, and feature flags.

By the end, you will have authenticated your terminal, bound a repository to a default environment, inspected your existing flags, created and toggled a flag, and evaluated targeting rules from your shell.

:::note[Prerequisites]
- **Node.js 22 or newer**
- An organisation project on the **Teams or Enterprise plan** (or an active Teams trial) to use Management API commands (`login`, `whoami`, `init`, `flags list`, `flags get`, `flags create`, and `flags toggle`). Flag evaluation (`flags eval`) works on any plan.
- A project API token (`rf_...`) created in the console under **Project > Tokens**.
:::

---

## Mental model: console to CLI

Three design choices anchor how the CLI works:

1. **Tokens belong to a single project (`rf_...`).** You create tokens in the console under **Project > Tokens**. Each token belongs to one project, has either `read` or `write` permission, and can be scoped to **All** environments or restricted to specific environments (such as `dev` and `test`, excluding `prod`).
2. **User credentials and repository config are kept separate.**
   - **Your credentials** are saved in `~/.config/rocketflag/config.json` with `0600` file permissions when you run `rocketflag login`.
   - **Your repository defaults** live in `.rocketflag.json` in your git repository when you run `rocketflag init`. It only ever stores `{ "projectId", "defaultEnv" }`, never tokens or secrets, so it is safe to commit.
3. **List by name, act by ID.** In RocketFlag, flag names are free text and SDKs evaluate flags by their immutable ID. `rocketflag flags list` shows both names and IDs (and can filter by `--name`), while point operations (`flags get`, `flags toggle`, and `flags eval`) take `<id>`.

---

## Step 0: Install or run `--help`

You can run the CLI directly with `npx rocketflag` or install it globally so `rocketflag` is always on your `PATH`:

```bash
npm install -g rocketflag
rocketflag --help
```

```text
rocketflag v0.1.0 - RocketFlag command-line interface

Usage:
  rocketflag <command> [options]

Commands:
  login                         Authenticate and save API token to ~/.config/rocketflag/config.json
  whoami                        Inspect active API token, permissions, and project environments
  init                          Initialise .rocketflag.json in the current repository
  flags list [--name <exact>]   List feature flags in the project
  flags get <id> [--env <env>]  Fetch details for a feature flag
  flags create <name> [options] Create a new feature flag
  flags toggle <id> [options]   Toggle a feature flag on or off
  flags eval <id> [options]     Evaluate a feature flag via the public Evaluation API

Global options:
  --token <rf_...>              Override API token (or set ROCKETFLAG_TOKEN)
  --env <name>                  Override target environment (or set ROCKETFLAG_ENV)
  --api-url <url>               Override API base URL (or set ROCKETFLAG_API_URL)
  --json                        Output machine-readable JSON
  -h, --help                    Show help
  -v, --version                 Show version
```

Every command and subcommand supports `--help` (for example, `rocketflag flags create --help`) and `--json` for machine-readable output.

---

## Step 1: Log in (`rocketflag login`)

In the [RocketFlag console](https://console.rocketflag.app), open your project, go to **Tokens** in the sidebar, and click **Create Token**. Choose **Write** permission (so you can create and toggle flags in this walkthrough), select the environments the token should be allowed to touch, and copy the `rf_...` token secret.

Run `rocketflag login`:

```bash
rocketflag login
```

In an interactive terminal, the CLI prompts you for your token (`Enter RocketFlag API token (rf_...): `), validates it against `GET /api/v1/token` before writing anything to disk, and saves it to `~/.config/rocketflag/config.json`:

```text
Authenticated with RocketFlag.
Project: Storefront (Pj2cV8yN4bRk7ZsD1qXm)
Token: Local Dev CLI (Tk6eW3hB9uLa1NxQ5oSd)
Permission: write
Allowed environments: dev, test
Saved credentials to /home/you/.config/rocketflag/config.json
```

You can also pass `--token rf_...` directly (or set `ROCKETFLAG_TOKEN` in CI).

**Built-in guardrails on login:**
- If you log in with a `read` token, `login` succeeds and prints a note letting you know that `flags create` and `flags toggle` require a Write token.
- If the token is restricted to an environment that was later renamed or deleted on the project, the CLI prints a stale-environment warning on `stderr`.

---

## Step 2: Check your active context (`rocketflag whoami`)

Whenever you open a terminal and want to check which project, permission level, or environment scope your active token has, run `rocketflag whoami`:

```bash
rocketflag whoami
```

```text
Token: Local Dev CLI (Tk6eW3hB9uLa1NxQ5oSd)
Permission: write
Project: Storefront (Pj2cV8yN4bRk7ZsD1qXm) [multi-environment]
Project environments: dev, test, prod
Token allowed environments: dev, test
Expiry: never
```

Notice the difference between `Project environments` (`dev, test, prod`) and `Token allowed environments` (`dev, test`): a local development token can be scoped so it cannot accidentally modify `prod`.

---

## Step 3: Bind your repository (`rocketflag init`)

Inside your application repository, run `rocketflag init`:

```bash
rocketflag init
```

How `init` behaves depends on your project configuration:
- **Multi-environment project with multiple allowed environments:** prompts you to choose your default environment (`Select default environment (dev, test): `) or accepts `rocketflag init --env dev`.
- **Multi-environment project where the token only allows one environment:** selects that environment automatically without prompting.
- **Single-environment project:** writes `{ "projectId": "..." }` directly.

```text
Select default environment (dev, test): dev
Initialised RocketFlag project 'Storefront' (Pj2cV8yN4bRk7ZsD1qXm) with defaultEnv 'dev' in /path/to/repo/.rocketflag.json
```

Inspect the generated `.rocketflag.json`:

```json
{
  "projectId": "Pj2cV8yN4bRk7ZsD1qXm",
  "defaultEnv": "dev"
}
```

The CLI searches from your current working directory up to the filesystem root for `.rocketflag.json`, so commands run from any subfolder of your repository automatically target `dev` unless you override it with `--env` or `ROCKETFLAG_ENV`.

---

## Step 4: Inspect existing flags (`flags list` and `flags get`)

List all flags in the project:

```bash
rocketflag flags list
```

```text
ID                    NAME          KIND        STATE / ENVIRONMENTS
Gp9rS5dH1jXe6UaM0fTw  checkout_v2   groupflag   dev:on(100%), test:off(100%)
```

- Filter to an exact flag name with `rocketflag flags list --name checkout_v2`.
- On a multi-environment project, `STATE / ENVIRONMENTS` shows the environments within your token's allowed scope.

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

If you attempt to toggle an environment that your token is not permitted to access (such as `prod` with a `dev, test` token), the API refuses the request with exit code `3` and tells you which environments the token allows:

```text
❯ rocketflag flags toggle JlBvxKerlbE6mdIEGnbF --env prod --on
Environment not allowed (403): Environment not permitted: This token cannot use the "prod" environment. It is limited to: test, dev
```

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

## Next steps

- **[CLI & MCP Server Reference](/dev/cli-and-mcp/):** Full option tables, environment variable precedence, exit codes (`0`, `1`, `2`, `3`), and AI coding agent setup (`@rocketflag/mcp`).
- **[CI Recipes](/dev/ci-recipes/):** Copy-and-paste GitHub Actions and shell workflows for post-deploy flag toggles, staged rollouts, and kill switches.
- **[Management API](/api/management/):** Underlying `/api/v1` HTTP endpoints, merge patch semantics, and rate limits.
