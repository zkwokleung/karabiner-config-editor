# Karabiner Config Editor

A visual editor for [Karabiner-Elements](https://karabiner-elements.pqrs.org/)
configuration files.

Instead of manually editing `karabiner.json`, you can import, edit, validate,
and export configurations with a structured UI.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Usage Workflow](#usage-workflow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Quality Checks](#quality-checks)
- [Contributing](#contributing)
- [License](#license)

## Overview

Karabiner-Elements is powerful, but direct JSON editing becomes difficult as
rules grow. This project provides:

- a profile-oriented editor for simple, fn, and complex mappings
- keyboard-first visual mapping tools
- validation and conflict checks before export

## Features

- Complex modification builder with drag-and-drop ordering
- Rule templates for common setups (Hyper key, Vim-style navigation, and more)
- Profile-level and device-level simple modifications
- Profile-level and device-level fn key mapping
- Real-time config validation and export safeguards
- JSON import, preview, copy, and download
- Keyboard layout support (ANSI, ISO, JIS)

## Documentation

- `docs/ARCHITECTURE.md`: system design, data flow, and module boundaries
- `docs/DEVELOPMENT.md`: local setup, workflow, and coding standards
- `docs/USER_GUIDE.md`: end-user workflow for import/edit/export
- `docs/VALIDATION_AND_LIMITATIONS.md`: validation rules and current limits

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+

### Install and Run

```bash
git clone https://github.com/zkwokleung/karabiner-config-editor.git
cd karabiner-config-editor
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Usage Workflow

1. Import an existing `karabiner.json`, paste JSON, or start from default.
2. Edit profiles, device mappings, fn keys, and complex rules.
3. Resolve warnings/errors shown by validation.
4. Export as `karabiner.json` or copy JSON to clipboard.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- `@dnd-kit` for drag and drop
- `react-simple-keyboard` for visual keyboard interactions

## Project Structure

```text
src/
  app/                          # App entry, layout, global styles
  components/
    complex-modifications/      # Complex rule editor and builder
    keyboard/                   # Shared keyboard rendering shell
    mapping/                    # To-event and condition editors
    profile/                    # Profile/device/simple/fn editors
    ui/                         # UI primitives
  hooks/                        # Shared hooks (toast)
  lib/                          # Constants, validation, keyboard mappings
  types/                        # Domain type definitions
docs/                           # Project documentation
```

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start development server                 |
| `pnpm build`        | Build for production                     |
| `pnpm start`        | Start production server                  |
| `pnpm lint`         | Run ESLint                               |
| `pnpm format`       | Format code with Prettier                |
| `pnpm format:check` | Check formatting without writing changes |

## Quality Checks

Run these before opening a PR:

```bash
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit
pnpm build
```

## Contributing

Please read `docs/DEVELOPMENT.md` before contributing.

Recommended flow:

1. Create a branch (`feature/<name>` or `fix/<name>`).
2. Make focused changes with clear commit messages.
3. Run quality checks locally.
4. Open a pull request with:
   - problem statement
   - scope of changes
   - screenshots (for UI changes)
   - validation steps

## License

This project is licensed under the MIT License. See `LICENSE` for details.
