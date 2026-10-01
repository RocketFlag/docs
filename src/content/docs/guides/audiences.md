---
title: Audiences
description: Target a flag at users by attributes such as plan or region, using reusable project audiences.
---

:::caution[Preview]
Audiences are a first iteration. They are marked **Preview** in the console and may change.
:::

An **audience** is a named, reusable set of rules over attributes of a request, such as `plan`, `country` or `region`. You define it once in a project, then pick it on any flag (or on one environment of a [group flag](/guides/group-flags/)). The flag is only enabled for requests that match the audience.

Audiences are deliberately simple. There is no regex, no semantic version comparison and no numeric comparison. Every match is an exact string check, which keeps evaluation fast and predictable.

### How an audience is built

- An audience has **one to five rules**. The audience matches when **any one** rule matches (rules are OR'd).
- A rule has **one to three conditions**. A rule matches when **all** of its conditions match (conditions are AND'd).
- A condition is an **attribute**, an **operator** and **one to ten values**.

For example, this audience matches Pro or Team customers in Australia, or anyone on the Enterprise plan:

| Rule | Conditions |
| :--- | :--- |
| Rule 1 | `plan` is one of `pro`, `team` **and** `country` is one of `AU` |
| Rule 2 | `plan` is one of `enterprise` |

### Operators

| Operator | Matches when | Example |
| :--- | :--- | :--- |
| is one of (`in`) | the attribute equals any listed value | `plan` is one of `pro, team` matches `?plan=pro` |
| is not one of (`not_in`) | the attribute is present and equals none of the listed values | `plan` is not one of `free` matches `?plan=pro`, but not `?plan=free` and not a request with no `plan` |
| starts with (`starts_with`) | the attribute starts with any listed value | `region` starts with `ap-` matches `?region=ap-southeast-2` |

### Matching rules to know

- **Matching is exact and case-sensitive.** `Pro` does not match `pro`. There is no trimming and no normalisation, so `pro ` with a trailing space does not match `pro`.
- **An absent attribute never matches.** If the request does not carry the attribute at all, no condition on it matches, including **is not one of**. To treat "no plan sent" as free, use a rule such as `plan` is one of `free` and send `plan=free` from your application.
- **An empty attribute is still present.** `?plan=` is present with the value `""`, so it can satisfy **is not one of**.

### Limits

| Limit | Value |
| :--- | :--- |
| Audiences per project | 10 |
| Rules per audience | 5 |
| Conditions per rule | 3 |
| Values per condition | 10 |
| Audience name | 1 to 50 characters. Names must be unique in a project, ignoring case and surrounding whitespace. A duplicate is refused with a `409`. |
| Attribute key | 1 to 32 characters of letters, digits, `_` and `-`. `cohort`, `env` and `targetingKey` are reserved and cannot be used. |
| Value | 1 to 64 characters, no leading or trailing whitespace, and cannot contain semicolons (`;`) |

### Sending attributes from your application

Attributes travel as **flat query parameters** on the evaluation request. Any query key other than the reserved `cohort`, `env` and `targetingKey` is treated as an attribute:

```bash
curl "https://api.rocketflag.app/v1/flags/ABC123def456?targetingKey=user-42&plan=pro&country=AU"
```

Values are strings, and you must URL-encode them as you do `cohort`. If a key is repeated, its first value is used. Attributes are only read when the flag has an audience, so sending extra attributes to a flag without one costs nothing. The SDKs pass attributes through the same context you already use for `cohort` and `env`. See the [Node.js](/dev/node-sdk/#attributes-and-sticky-rollouts), [Go](/dev/go-sdk/#attributes-and-sticky-rollouts), [React](/dev/react-sdk/#attributes-and-sticky-rollouts) and [Python](/dev/python-sdk/#attributes-and-sticky-rollouts) SDK pages.

> **Privacy:** Attributes are read only to match the audience and are not saved with your flag data. Because they travel in the URL, they can appear in infrastructure request logs like any URL parameter, so prefer coarse values such as `plan` or `region` over personal data such as email addresses.

### Creating an audience

Editors, Admins and Owners can create, edit and delete audiences. Viewers can see the list.

1. Open a project and select the **Audiences** tab.
2. Click **New audience** and give it a name.
3. Add a rule, then add up to three conditions to it. Add more rules (up to five) for alternatives.
4. Click **Create audience**.

You can also create an audience from inside a flag editor by choosing **New audience...** in the Audience field. That opens a side drawer that only creates. To edit an audience later, use the **Audiences** tab.

Each audience displays its ID on the **Audiences** page and in the editor, with a copy button to easily copy it for use with the [Management API](/api/management/).

To test a new audience, create it first, then open it from the **Audiences** tab. The **Try it** panel is not shown while you are creating an audience, in either the **New audience** form or the flag editor's drawer.

#### Try it

Open an existing audience from the **Audiences** tab to use the **Try it** panel. Paste a query string such as `plan=pro&country=AU`, click **Try**, and see whether the audience matches and which rules matched, for example *Matched rules 1 and 2*. Evaluation stops at the first match, but **Try it** lists every rule the query satisfies.

**Try it** checks the rules as they are currently shown in the editor, saved or not, so you can test an edit before you save it. If you have not changed anything, that is the saved rules. The rules on screen are validated exactly as a save would validate them, so while they are incomplete or invalid, **Try** is disabled and the panel shows *Complete the rules above to try them*. A result is cleared as soon as you change a rule, so it never sits beside rules it was not worked out for. **Try it** uses the same matcher as evaluation, so it is the quickest way to confirm case and absent-attribute behaviour.

### Using an audience on a flag

Open a flag and click **Edit** (for a group flag, edit the environment you want). The targeting section has three fields, in this order:

| Field | What it does |
| :--- | :--- |
| **Always on for** | The cohort list. Identifiers listed here always get the enabled value. |
| **Audience** | Who the flag is for. **Everyone** (the default) applies no audience. Choose an audience by name to restrict the flag to matching requests. |
| **Rollout** | The traffic percentage. With an audience selected it is a percentage of the audience, and it is [sticky per user](/guides/feature-flags/#sticky-rollouts). |

On a group flag each environment has its own audience, so staging can target `plan` is one of `pro` while production targets a different audience.

Flags that use an audience show a yellow audience badge in the flags table. Editing an audience updates every flag and environment that uses it. The console lists the affected flags, production first, and asks you to confirm before saving if any of them are enabled. An audience that is still used by a flag cannot be deleted until you clear it from those flags.

### How a flag is evaluated

Evaluation is a short, fixed sequence. The first step that produces an answer wins.

1. **Disabled.** A disabled flag (or an unknown or disabled environment of a group flag) returns `false`.
2. **Always on for.** If the request's `cohort` is in the flag's cohort list, return `true`. This skips the audience and the rollout.
3. **Audience.** If the flag has an audience and the request does not match it, return `false`. If it matches, continue to step 5.
4. **Cohorts but no audience.** If there is no audience and cohorts are configured, return `false`. Only the cohort list is let through, exactly as flags behaved before audiences existed.
5. **Rollout.** A rollout of 100% returns `true`. Otherwise the request is bucketed by its [key](/guides/feature-flags/#sticky-rollouts) and gets `true` when its bucket is below the percentage. With no key, it is a random roll on each request.

A request with an invalid `cohort` is rejected with a `400` before any of these steps. Cohorts may contain letters, digits and `. _ - + @ :` only, so an email address or an id such as `uid:1234` is fine.
