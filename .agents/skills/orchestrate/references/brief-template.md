# Brief: <title>

slug: <slug>
status: open | agreed | done (<commit>)
agent: <label you gave the agent, so you can message it back>

## Decision

What we're building and why. The "why" is not decoration — it's what lets the
agent make the small unlisted calls the way you would have.

## Owns

```
src/components/Foo/**
src/hooks/useFoo.ts
```

Anything not in this list is read-only for this agent.

## Intent

Exactly what to build, in enough detail that two different agents would produce
the same thing. Behaviour, states (empty / loading / error), edge cases, copy
(verbatim — never let an agent write user-facing text), and what the thing must
not do.

If a decision is deliberately left to the agent, say so explicitly. Silence
reads as an omission and gets filled in with the agent's taste.

## Hard rules

<paste the hard-rules block from SKILL.md>

## Verify

Run:
- `pnpm type-check`
- `pnpm lint`
- `pnpm test --run`
- <`pnpm test:e2e` when behaviour is user-visible>

Measure:
- <what to observe, e.g. "popup renders under 400ms with 50 gates">

Screenshots (exact names, saved to `.agents/scratch/<slug>/shots/`):
- `popup-default.png` — popup at 400x600, default state
- `popup-empty.png` — same viewport, no results
- `sheet-open.png` — detail sheet open on the first row

Write `.agents/scratch/<slug>/checks.json`:

```json
{
  "slug": "<slug>",
  "checks": [
    { "id": "types", "cmd": "pnpm type-check", "expected": "exit 0", "actual": "", "pass": false }
  ]
}
```

## Report

<paste the fixed report format from SKILL.md>
