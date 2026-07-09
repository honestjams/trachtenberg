# Trachtenberg — Speed Math

A mobile-first web app for learning the [Trachtenberg system](https://en.wikipedia.org/wiki/Trachtenberg_system)
of speed multiplication: interactive digit-by-digit tutorials for every rule
(×2 through ×12) plus endless practice with step-by-step solutions.

## Features

- **Learn** — the five core concepts (neighbors, leading zeros, halving,
  the odd +5, carries) and an interactive walkthrough for each multiplier rule,
  presented in the classic learning order from Trachtenberg's book, plus the
  direct (two-finger) method for multiplying any two large numbers.
- **Practice** — endless randomly generated problems. Pick which rules to
  drill and how many digits the numbers have; every question can be replayed
  step by step the Trachtenberg way.
- **Stats** — streaks, accuracy, and per-rule mastery, stored locally on device.

## Tech

Vite + React + TypeScript single-page app, no backend. The heart of the app is
`src/lib/trachtenberg.ts`, a rule engine that works out any product exactly the
way the method teaches it — digit by digit, right to left, with carries — and
records every step so the UI can replay it. The engine is exhaustively tested
against real multiplication in `src/lib/trachtenberg.test.ts`.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # engine test suite
npm run build    # typecheck + production build to dist/
```

Deployed on Vercel; `vercel.json` rewrites all routes to `index.html` for
client-side routing.
