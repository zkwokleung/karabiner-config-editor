# Karabiner Config Editor

Karabiner Config Editor helps Mac power users orchestrate Karabiner-Elements
workflows without touching JSON. Import your existing `karabiner.json`, explore
profiles through an intuitive UI, and export a validated configuration in
seconds.

## Why this project exists

Karabiner-Elements is incredibly flexible, but managing complex key remaps by
hand is error-prone. A single typo or duplicate mapping can break your setup.
This editor focuses on discoverability and guard rails so you can experiment
with complex manipulations while always knowing the resulting JSON’s shape.

## Feature highlights

- Complex modification builder: compose manipulators with drag-and-drop
  ordering, inline search, modifier helpers, condition builders, and conflict
  detection.
- Rule templates and quick starts: drop in common Karabiner recipes (hyper key,
  Vim navigation, spacebar held actions, input source switching) as a starting
  point.
- Live preview and export: see the generated JSON at all times, copy to the
  clipboard, or download a `karabiner.json` file once validation passes.

## Typical workflow

1. Launch the app locally (`pnpm dev`) or visit the production deployment on
   Vercel.
2. Import an existing configuration via file upload or paste raw JSON.
3. Use the Simple, Fn, and Complex tabs to tweak mappings at the profile or
   device level.
4. Resolve any validation issues surfaced in the Export tab, then copy or
   download the generated JSON.

## Tech stack

- Next.js 15 App Router with TypeScript and React Server Components.
- Tailwind CSS with shadcn/ui primitives for consistent styling.

## Project structure

```
src/
  app/
    layout.tsx        # Theme wiring and global providers
    page.tsx          # Import → edit → export workflow
  components/
    profile/          # Profile, device, and Fn key editors
    complex-modifications-editor.tsx
    rule-templates.tsx
    condition-editor.tsx
    to-event-editor.tsx
    ui/               # shadcn/ui primitives
  hooks/
    use-toast.ts      # Toast notifications
  lib/
    validation.ts     # Config validation, duplicate and conflict detection
    utils.ts
  types/
    karabiner.ts      # Karabiner-Elements schema definitions
    profile.ts
public/
  favicon.ico and static assets
```

## Local development

- `pnpm install` to install dependencies (keep `pnpm-lock.yaml` committed).
- `pnpm dev` to run the development server at http://localhost:3000.
- `pnpm lint` to enforce the TypeScript and React rule set.
- `pnpm format` or `pnpm format:check` to keep Prettier (with the Tailwind
  plugin) happy.
- `pnpm build` followed by `pnpm start` to verify the production bundle before
  publishing.

## Deployment and sync

- The project deploys through Vercel. Every push to the main branch rebuilds the
  production instance.
- Changes made in [v0.app](https://v0.app/chat/projects/8N4NAcY0bOf) sync back
  into this repository automatically; avoid editing generated files like
  `components.json` without mirroring updates in v0.
- Environment-specific secrets live in the Vercel dashboard; keep local `.env`
  files out of version control.
- After a merge, smoke test profile editing in the Vercel preview and confirm
  the production instance still exports a usable `karabiner.json`.

## Contributing

Issues and feature requests are welcome—focus on ergonomic wins for people who
live in Karabiner daily. When proposing changes, document manual validation
steps (keyboard navigation and availability of accessibility affordances) until
automated tests are introduced.
