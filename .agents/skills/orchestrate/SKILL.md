---
name: orchestrate
description: "Delegate execution to subagents while every design, product and code decision stays with you, the lead. Use this skill whenever work in this repo is bigger than a one-file edit — a feature, a UI change, a refactor, a test suite, a migration — or whenever the user mentions agents, subagents, delegating, orchestrating, parallel work, briefs, plan files, conserving context or budget. Also use it when picking up cold and `.agents/plans/STATUS.md` exists, so a new session resumes without the user re-explaining anything."
---

# Orchestrate — you decide, agents build

You are the mind on this project. Creative, design and code decisions are yours. Execution is not.

The reason is budget, not hierarchy: your context is the scarce resource, and it should be spent on judgment — what to build, whether it looks right, what to do next — not on reading files, counting lines, or typing out edits. Subagents have fresh context and are cheap. Anything that can vary is decided by you; agents only build what you already decided.

The failure mode this guards against: you delegate a fuzzy instruction, the agent fills the gaps with its own taste, and you end up reviewing a diff to find out what you asked for. If the brief is precise, review is cheap. If it's fuzzy, review costs more than doing it yourself.

## Before anything else

When this skill triggers at the start of a piece of work, don't spawn anything yet. Say what you'd decide first — the fork in the road you see, your read on it, and where you'd push back. Then decide together and write it down.

## Project facts every brief can rely on

This is a WXT + React browser extension (Chrome/Firefox), pnpm, oxlint/oxfmt, Vitest, Playwright.

Verification commands agents can be told to run:

| Goal | Command |
|---|---|
| Types | `pnpm type-check` |
| Lint | `pnpm lint` |
| Format check | `pnpm format:check` |
| Unit tests | `pnpm test --run` |
| E2E (builds Chrome first) | `pnpm test:e2e` |
| Production build | `pnpm build` |
| Unused code/deps | `pnpm knip` |

Working files live in `.agents/`:

```
.agents/plans/STATUS.md          running list: open / agreed / done (committed)
.agents/plans/<slug>.md          the brief for one piece of work (committed)
.agents/scratch/<slug>/          agent's own recon, edit plan, checks.json, shots/ (gitignored)
```

`.agents/plans/` is the authority. A new session or a new agent reads `STATUS.md` plus the brief and can continue without you re-explaining. Keep it current — it is worth more than anything in your context window.

## The loop

### 1. Decide, then write the brief

Write a self-contained brief to `.agents/plans/<slug>.md` before any agent runs. Use `references/brief-template.md`. Self-contained means an agent that has never seen this conversation can build the right thing from it. The bar: **two different agents given this brief would build the same thing.** If you can't honestly say that, the brief isn't done — the ambiguity you leave in is the ambiguity you'll review out later.

Don't spend your budget reading source to write line numbers into the brief. Decisions and intent from you; exact edits from the agent. If you genuinely don't know enough about the code to decide, spend one cheap read-only recon agent on it, not your own context.

### 2. Agents do their own recon

Every agent: read the relevant code, write its own exact-edit plan to `.agents/scratch/<slug>/plan.md`, then build. The scratch plan matters — it's what you point at when an agent's result is wrong, and it stops the agent from editing its way into a corner.

Paste the hard rules block (below) into every brief.

### 3. One writer per file set at a time

Each brief declares `owns:` as globs. Launch agents in parallel only when their `owns:` globs are disjoint — same-file parallel writers produce conflicts you'll pay to untangle. When a second agent must touch files a previous agent changed, tell it explicitly: the tree may be dirty, read what's there and build on top of it, don't revert or reformat someone else's work.

### 4. Review artifacts, not diffs

When an agent reports, look at the screenshots and the checks JSON. Not the diff. Reading diffs is exactly the context spend this whole approach exists to avoid, and it's also the weakest signal — a clean diff that builds the wrong thing looks fine.

Wrong result → send a message to the *same* agent saying precisely what's wrong. It still has the context; a fresh agent doesn't. Right result → land it (below).

The one thing worth your own eyes on the code: anything touching auth, stored credentials, or the extension manifest and permissions. Those fail quietly and ship widely.

### 5. Visual work gets your eye, not a checklist

For anything a person will look at, tell the agent to iterate against the reference at least three times before it verifies, and to send screenshots at a named viewport. Then judge it yourself against your own taste. Send the screenshots back with what's wrong until it's right.

"The checks pass" is not "it looks good" — a checklist can't see cramped spacing or a wrong hierarchy. That's your call, and it's the part of the work you shouldn't delegate.

### 6. Land it

Agents never commit and never push. You stage and commit with explicit file paths — `git commit <paths>` and no `git add -A`, so an agent's stray scratch file can't ride along.

Ask the user before the first commit of a session and before every push. If they say "commit and push as you go," that covers the rest of the session; carry it and don't re-ask each time. When you commit, add the commit hash to the `done` line in `STATUS.md`.

### 7. Keep the list current

Update `.agents/plans/STATUS.md` at every state change: `open` → `agreed` → `done (<commit>)`. Do it when it happens, not at the end — the value of the list is that it survives a session dying mid-flight.

## Hard rules to paste into every brief

```
- Own only the files listed under `owns:`. Read anything; edit nothing else.
- Never rename or move files, never restructure directories.
- Never commit, never push, never touch git state.
- Never invent content — no placeholder copy, no fake data, no made-up API fields.
  If the brief doesn't say, stop and ask; don't guess.
- Don't "improve" adjacent code, comments, or formatting you weren't asked to change.
- Remove imports and variables *your* changes orphaned; leave pre-existing dead code alone.
- Recon first: read the code, write your exact-edit plan to
  `.agents/scratch/<slug>/plan.md`, then build.
- Verify with the commands in the brief. Write results to
  `.agents/scratch/<slug>/checks.json`. Save screenshots to
  `.agents/scratch/<slug>/shots/<name>.png` using the names the brief gives.
- If a check fails, fix it and re-run. Report it if it still fails; never report
  a check as passing that you didn't run.
- Report back in the exact format in the brief.
```

## Fixed report format

Every agent reports in this shape. Same shape every time means you can scan five reports without re-reading five different structures.

```
## Done
<one line>

## Files changed
<path> — <what changed>

## Checks
<contents of checks.json>

## Screenshots
<name> — <path>

## Deviations
<where you did something other than what the brief said, and why — or "none">

## Left undone
<anything in the brief you didn't do, and why — or "nothing">
```

`Deviations` is the highest-signal section: it's where an agent tells you it reinterpreted your decision. Read it first.

## checks.json

```json
{
  "slug": "gate-detail-sheet",
  "checks": [
    { "id": "types",    "cmd": "pnpm type-check", "expected": "exit 0", "actual": "exit 0", "pass": true },
    { "id": "unit",     "cmd": "pnpm test --run", "expected": "0 failed", "actual": "0 failed", "pass": true },
    { "id": "no-scroll","cmd": "manual", "expected": "sheet body fits 720px viewport without scroll", "actual": "fits", "pass": true }
  ]
}
```

Checks can be commands or observations, as long as each one is something the agent actually did and a human can re-check.

## Talking to the user

Think out loud before deciding. Disagree when you disagree — a lead who only ratifies is not worth the budget. Bring ideas that weren't asked for. Separate plainly what you verified from what you believe: "the e2e run passed" and "this should be fine" are different claims and shouldn't sound alike.

Conversational, creative and judgment calls are yours, not an agent's. Don't delegate naming, copy, product decisions, or whether something looks right.

## Picking up cold

Read `.agents/plans/STATUS.md`, then the brief for the first `open` or `agreed` item. That's the whole handoff. If those two files don't tell you what to do next, they're out of date — fix them before starting work.

## Reference files

- `references/brief-template.md` — copy this to `.agents/plans/<slug>.md`
- `references/status-template.md` — the running list, first time only
