---
title: Sample Projects
description: Working example applications that integrate RocketFlag.
---

The best way to see RocketFlag in action is to run a real app. These open-source samples show end-to-end integration you can clone, run, and adapt.

### React Demo

A minimal React + Vite + TypeScript app that initialises a RocketFlag client and conditionally renders UI based on a flag's state.

- **Repository:** [github.com/RocketFlag/react-rocketflag](https://github.com/RocketFlag/react-rocketflag)

```bash
git clone https://github.com/rocketflag/react-rocketflag.git
cd react-rocketflag
npm install
npm run dev
```

Open `http://localhost:5173`, set your own Flag ID in `src/App.tsx`, and toggle the flag in the [console](https://console.rocketflag.app) to watch the UI change.

> **Tip:** This sample fetches flags with the core client and a manual `useEffect`. For new React apps we recommend the [React SDK](/dev/react-sdk/), which gives you a provider, the `useFlag` hook, and a declarative `<Flag>` component with built-in loading/error handling.

### Build Your Own

Whatever your stack, getting started is the same three steps:

1. Create a flag in the [console](https://console.rocketflag.app) — see the [Quick Start](/guides/quick-start/).
2. Install the relevant SDK ([Node](/dev/node-sdk/), [React](/dev/react-sdk/), [Go](/dev/go-sdk/)) or call the [API](/dev/api-reference/) directly.
3. Read the flag's `enabled` value and branch your code on it.

Using a language we don't have an SDK for yet? The [API](/dev/api-reference/) is a single `GET` request — see the [Quick Start](/guides/quick-start/#step-3-evaluate-the-flag) for `curl`, JavaScript, Python, Ruby, and Go examples.
