# Architecture

## Purpose

This document explains how the Karabiner Config Editor is organized, how data
flows through the app, and where to add new features safely.

## High-Level Design

The app is a client-side editor with one core domain object: `KarabinerConfig`.

Primary flow:

1. Import JSON (`file`, `paste`, or `default config`)
2. Edit configuration in UI sections
3. Validate continuously
4. Export JSON

`src/app/page.tsx` orchestrates this flow and owns top-level state:

- `config`: current `KarabinerConfig`
- `validationErrors`: derived from `validateConfig`
- UI state for tabs and import text

## Module Boundaries

### App Layer

- `src/app/page.tsx`: import/edit/export workflow
- `src/app/layout.tsx`: global layout and metadata

### Domain Types

- `src/types/karabiner.ts`: Karabiner config interfaces
- `src/types/profile.ts`: profile/device targeting helper types

### Domain Logic

- `src/lib/validation.ts`: schema-like checks and conflict detection
- `src/lib/default-config.ts`: minimal valid config generator
- `src/lib/keyboard-layout.ts`: layout mapping and display helpers
- `src/lib/karabiner-keycodes.ts`: categorized key catalog

### Feature Modules

- `src/components/profile/*`: simple mods, fn keys, device-target editing
- `src/components/complex-modifications/*`: rule list/detail/builder workflow
- `src/components/mapping/*`: reusable condition and to-event editors
- `src/components/keyboard/*`: shared keyboard rendering/presentation

### UI Primitives

- `src/components/ui/*`: button, dialog, tabs, select, etc.

## Data Flow

State ownership pattern:

- `page.tsx` owns the full config object
- child editors receive slices + callbacks
- child editors return immutable updates to parent

Update pattern:

1. User edits in nested component
2. Component builds updated profile/rule/mapping
3. Parent callback replaces affected branch
4. Root `updateConfig` re-runs validation
5. Export tab reflects latest config and errors

## Validation Strategy

Validation is currently runtime and UI-oriented:

- required profile/rule/manipulator fields
- incomplete mappings
- duplicate simple mappings
- conflicting complex mapping sources

Validation blocks export when severity is `error`.

## Extension Guidelines

When adding features:

1. Extend `src/types/karabiner.ts` first.
2. Add/update validators in `src/lib/validation.ts`.
3. Add UI controls in the smallest relevant feature module.
4. Ensure updates flow through parent callbacks only.
5. Verify import/edit/export behavior manually.

## Known Architectural Tradeoffs

- Large feature components hold substantial UI + state logic.
- Test coverage is not yet present (manual verification required).
- Build is currently configured to ignore TypeScript errors unless
  `pnpm exec tsc --noEmit` is run explicitly.
