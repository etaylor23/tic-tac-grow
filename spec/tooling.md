# Tooling

Two quality gates run after implementation, before reconciling (see the Development flow in
[CLAUDE.md](../CLAUDE.md)). Both live in `client/` and exit non-zero on findings.

## ESLint — correctness linting
- **Command:** `npm run lint` (`eslint src`, scoped to source so config files aren't linted).
- **Config:** `client/eslint.config.js` (flat config, CommonJS to match the repo's other configs).
- **Rule sets:**
  - `@eslint/js` recommended — core JS correctness.
  - `typescript-eslint` recommended — TypeScript correctness (untyped/fast; `tsc` already does
    type-aware checking, so no `parserOptions.project` here).
  - `eslint-plugin-react-hooks` — `rules-of-hooks` (error) and `exhaustive-deps` (warn). This is
    the rule set the brief most cares about: it enforces correct hook usage and flags effects
    with missing/incorrect dependencies.
  - `eslint-plugin-react` — only `jsx-uses-react` + `jsx-uses-vars` enabled. The project uses the
    classic JSX runtime (`import React`, `jsx: 'react'`), so these stop `no-unused-vars` from
    falsely flagging `React` and JSX-referenced component imports. The plugin's noisier rules
    (e.g. `prop-types`) are intentionally left off — types come from TypeScript.
  - Test files get Jest globals (`describe`/`it`/`expect`/`jest`) via a `*.test.*` override.
- **Version note:** pinned to ESLint **v9**, not v10 — `eslint-plugin-react@7` does not yet
  support v10. v9 is current and is the canonical pairing for this plugin set.

## knip — dead-code & dependency pruning
- **Command:** `npm run knip`.
- **Config:** `client/knip.json`.
  - `entry`: the test files (`src/**/*.test.{ts,tsx}`). The app entry `src/index.tsx` is detected
    automatically from the webpack config, so it isn't listed.
  - `project`: `src/**/*.{ts,tsx}` — the files knip analyses.
  - knip's built-in plugins resolve config-referenced tooling (webpack loaders, jest, tailwind,
    postcss, eslint), so those dependencies aren't reported as unused.
- **What it checks:** unused files, unused exports, and unused dependencies.
- **Found and fixed:** flagged `@types/lodash` as an unused dependency (starter cruft, no lodash
  in the project) — removed.
- **False positives:** if a real dependency is only referenced in a way knip can't trace, add it
  to `ignoreDependencies` in `knip.json` rather than deleting it.

## How they fit the flow
After the tests are green, run `npm run lint` and `npm run knip`. Lint failures are fixed in
place; knip findings are either removed (genuine dead code/deps) or explicitly ignored (traced
false positives). Only then reconcile spec ↔ tests ↔ implementation.
