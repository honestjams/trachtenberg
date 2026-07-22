# Trachtenberg — Speed Math & High-School Mathematics

A mobile-first web app with two modes, chosen on load:

- **Mathematics** — the high-school journey, grades 7–12: pre-algebra,
  Algebra I, Geometry, Algebra II and Precalculus. 33 topics, each with a
  concept lesson, regenerable worked examples, and endless auto-graded
  practice. Answers support integers, negatives, decimals, fractions,
  coordinate pairs / multiple roots (comma-separated), and multiple choice.
  **Battle mode** pairs you live against another player (Mathletics-style):
  same questions, 60 seconds, most correct answers wins — with live score
  sync over Supabase Realtime, and a robot opponent when no one is around.
- **Trachtenberg** — the [Trachtenberg system](https://en.wikipedia.org/wiki/Trachtenberg_system)
  of speed mathematics: interactive digit-by-digit tutorials for every rule
  plus endless practice with step-by-step solutions.

## Trachtenberg features

- **Learn** — the five core concepts (neighbors, leading zeros, halving,
  the odd +5, carries) and an interactive walkthrough for each multiplier rule,
  presented in the classic learning order from Trachtenberg's book; the direct
  (two-finger) method for multiplying any two large numbers, with an animated
  sliding-finger visualization; speed addition (the never-count-past-11 tick
  method); speed division with the sliding remainder; the squaring shortcuts
  (ends in 5, near 50, near 100); and the digit-sum check for catching errors.
- **Practice** — endless randomly generated problems across every skill. Pick
  what to drill and how big the numbers get; every question can be replayed
  step by step the Trachtenberg way. Answers are typed units-first by default
  (matching the order the method produces digits) with a left-to-right toggle.
- **Stats** — streaks, accuracy, and per-skill mastery, stored locally on device.

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
