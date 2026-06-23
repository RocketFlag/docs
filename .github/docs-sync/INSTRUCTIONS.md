# Docs sync — instructions for the model

You are maintaining the RocketFlag documentation site (Astro Starlight), whose
content lives under `src/content/docs/`. A new **tagged release** has been
published in one of the RocketFlag source repositories. Your job is to decide
whether that release requires documentation changes and, if so, make them.

## Inputs you are given

- `./context/RELEASE.md` — the release tag, name, and human-written release notes.
- `./context/CHANGES.patch` — the code diff between the previous release and this one.
- The source repo and tag are stated in the prompt that launched you.

## How to work

1. Read `./context/RELEASE.md` and `./context/CHANGES.patch`.
2. Identify only the **user-facing** changes: new/changed/removed public APIs,
   SDK methods, options, parameters, return shapes, error behavior, env vars,
   config, CLI flags, defaults, or documented workflows. Ignore internal
   refactors, tests, CI, lint, formatting, dependency bumps, and comments.
3. Read the relevant existing docs (see mapping below) before editing so your
   changes match the established structure, voice, and frontmatter.
4. Edit the relevant `.md` / `.mdx` files **in place** using your file tools.
   - Keep the existing frontmatter (`title`, etc.) intact.
   - Match the surrounding tone, formatting, and code-fence languages.
   - Update version numbers, install snippets, and code samples to reflect the
     release. Prefer minimal, surgical edits over rewrites.
   - If a brand-new feature has no home, add a section to the most relevant
     existing page rather than creating a new page (creating pages also needs a
     sidebar entry; avoid unless clearly warranted).
5. Do **not** touch anything outside `src/content/docs/`. Do not edit
   `astro.config.mjs`, build config, or the `context/` files.

## The no-op rule (important)

If the release contains **no user-facing change** that the docs should reflect
(e.g. it is purely internal, a chore, or a dependency bump), make **no edits at
all**. The workflow detects "no changes" and will simply skip opening a PR. Do
not invent changes or make cosmetic edits just to produce a diff.

## Source repo → docs mapping

| Source repo                | Primary docs to consider                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `RocketFlag/node-sdk`      | `src/content/docs/dev/node-sdk.md`                                 |
| `RocketFlag/react-sdk`     | `src/content/docs/dev/react-sdk.md`                                |
| `RocketFlag/go-sdk`        | `src/content/docs/dev/go-sdk.md`                                   |
| `RocketFlag/rocketflag`    | `src/content/docs/dev/api-reference.md`, `dev/protected-keys.md`, `dev/per-env-cohorts.md`, and `src/content/docs/guides/*` and `intro/*` where the release changes user-facing app/API behavior |

Treat the mapping as a starting point — if the diff clearly affects another
page (e.g. a concept, quick-start snippet, or example), update that page too.

## When in doubt

Prefer accuracy over coverage. It is better to leave docs unchanged than to
publish a confident-but-wrong API description. A human reviews every PR you
open, so flag uncertainty in your edits with a brief HTML comment
(`<!-- TODO: verify ... -->`) rather than guessing silently.
