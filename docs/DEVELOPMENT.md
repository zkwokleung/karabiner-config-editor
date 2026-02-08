# Development Guide

## Audience

Contributors who want to run, debug, and extend this project locally.

## Prerequisites

- Node.js 18+
- pnpm 9+

## Local Setup

```bash
pnpm install
pnpm dev
```

App URL: `http://localhost:3000`

## Development Workflow

1. Create a branch:

```bash
git checkout -b feature/<short-name>
```

2. Make focused changes.
3. Run quality checks:

```bash
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit
pnpm build
```

4. Commit with clear scope in message.
5. Open a PR with summary + validation steps.

## Coding Conventions

- Use TypeScript-first changes (types before UI changes).
- Keep mutations immutable and localized.
- Prefer existing shared components/utilities before adding new ones.
- Preserve existing file/module boundaries (profile, mapping, complex editor).
- Keep UI copy concise and action-oriented.

## Documentation Conventions

When behavior changes:

1. Update `README.md` if setup/usage changes.
2. Update architecture notes if module boundaries change.
3. Update user-facing workflow docs when UX changes.
4. Document known limitations instead of hiding them.

## Repository Quality Gates

- Husky + lint-staged run on pre-commit.
- ESLint and Prettier are expected to pass before merge.
- Explicit TypeScript check is recommended in CI and local workflow:
  `pnpm exec tsc --noEmit`.

## Recommended PR Template Content

- Problem statement
- Scope and non-goals
- Before/after screenshots (UI changes)
- Validation checklist:
  - lint
  - format check
  - type check
  - build
  - manual workflow tested
