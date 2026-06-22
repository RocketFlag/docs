# Docs sync automation — setup

Event-driven automation that proposes documentation updates when a **tagged
release** is published in a RocketFlag source repo.

```
source repo release ──► notify-docs.yml ──(repository_dispatch)──► RocketFlag/docs
                                                                        │
                                          docs-sync.yml: fetch diff ◄───┘
                                          ▼
                                  Gemini reviews diff vs docs
                                          ▼
                          edits made? ── no ──► no-op (notice, no PR)
                                │
                               yes
                                ▼
                          open DRAFT PR for human review
```

Files in this system:

- `docs/.github/workflows/docs-sync.yml` — the brain (runs in this repo).
- `docs/.github/docs-sync/INSTRUCTIONS.md` — the prompt/rules Gemini follows.
- `<source repo>/.github/workflows/notify-docs.yml` — dispatch on release.

Source repos wired up: `RocketFlag/node-sdk`, `RocketFlag/react-sdk`,
`RocketFlag/go-sdk`, `RocketFlag/rocketflag`.

> **Prerequisite:** all five repos must live under the **RocketFlag org** so a
> single org-level secret covers everything. If `rocketflag` is still under
> `jgunnink`, transfer it first (Settings → General → Transfer ownership →
> RocketFlag). After transfer, `github.repository` in its workflow becomes
> `RocketFlag/rocketflag` automatically; update any remotes/links as needed.

---

## 1. Create the GitHub App ("RocketFlag Docs Bot")

GitHub → **Organization settings → Developer settings → GitHub Apps → New GitHub
App** (create it under the **RocketFlag org**, not a personal account).

- **Name:** RocketFlag Docs Bot
- **Homepage URL:** https://docs.rocketflag.app
- **Webhook:** uncheck **Active** (not needed).
- **Repository permissions:**
  - **Contents:** Read and write
    _(write needed on `docs` for branches; also lets source workflows send
    `repository_dispatch`, which requires Contents: write on the target repo.
    `docs-sync.yml` narrows each minted token to the minimum it needs.)_
  - **Pull requests:** Read and write
  - **Metadata:** Read-only (mandatory default)
- **Where can this app be installed:** Only on this account.

Create it, then note the **App ID** and **Generate a private key** (downloads a
`.pem`).

## 2. Install the App (once)

From the App's page → **Install App** → install on the **RocketFlag org**, and
select the five repos: `docs`, `node-sdk`, `react-sdk`, `go-sdk`, `rocketflag`.

One installation now covers every repo, so `docs-sync.yml` mints all its tokens
from the same org installation.

## 3. Add the org secret (once)

RocketFlag org → **Settings → Secrets and variables → Actions → New
organization secret**. Create these and set **Repository access → Selected
repositories** = the five repos above:

| Secret                  | Scope                                   | Value                                    |
| ----------------------- | --------------------------------------- | ---------------------------------------- |
| `DOCS_BOT_APP_ID`       | org secret, selected repos              | the App ID                               |
| `DOCS_BOT_PRIVATE_KEY`  | org secret, selected repos              | full contents of the `.pem` file         |
| `GEMINI_API_KEY`        | org secret, **docs only** (or repo secret) | key from Google AI Studio (free tier ok) |

Get the Gemini key at https://aistudio.google.com/apikey.

## 4. Lock down where the secrets can be used

The docs-sync job runs in an **Environment** named `docs-sync`. In
`RocketFlag/docs` → **Settings → Environments → docs-sync**:

- **Deployment branches:** restrict to **Selected branches → `main`** so the App
  key is only available to workflow runs from the default branch.
- Optionally add **Required reviewers** for an extra human gate before a run can
  access the secrets.

Why this matters for "the token can't be copied out":

- Org/repo secrets are **never exposed to `pull_request` runs from forks**, and
  every trigger here (`release: published`, `repository_dispatch`,
  `workflow_dispatch`) is **maintainer-only** — untrusted contributors can't
  reach the key.
- The minted **installation tokens are short-lived (~1h) and auto-revoked** at
  job end; each is scoped to the minimum repo + permission it needs (read-only
  for source diffs, write only on `docs`).
- The **Gemini step has no GitHub token in its environment**, so a prompt
  injection smuggled through a release diff has no credential to exfiltrate.

## 5. Merge the workflows to `main`

`repository_dispatch` and `release` triggers only fire from the workflow file on
each repo's **default branch**, so `docs-sync.yml` and every `notify-docs.yml`
must be merged to `main` to go live.

## 6. Test

- **Manual:** in `RocketFlag/docs` → Actions → "Docs sync (Gemini)" → Run
  workflow, with e.g. `repo = RocketFlag/node-sdk`, `tag = <an existing tag>`.
- **End-to-end:** publish a release in a source repo and watch the docs repo
  Actions tab. A draft PR appears only if Gemini made edits.

## Notes & knobs

- **Model:** `gemini-2.5-pro` is set in `docs-sync.yml`. Bump as newer models ship.
- **No-op behavior:** if Gemini makes no edits, the run logs a notice and opens
  no PR. This is intentional.
- **Branch protection on `docs`:** require the existing build check + review so
  generated PRs can't auto-merge.
- **Supply-chain hardening (recommended):** pin the third-party actions
  (`actions/create-github-app-token`, `peter-evans/repository-dispatch`,
  `google-github-actions/run-gemini-cli`) to full commit SHAs instead of tags.
- **Diff size:** the code diff is truncated to ~200 KB before reaching the model.
