# Karabiner Config Editor

A visual editor for [Karabiner-Elements](https://karabiner-elements.pqrs.org/)
configurations. Import your existing `karabiner.json`, explore profiles through
an intuitive UI, and export a validated configuration—without touching JSON.

## Why This Project Exists

Karabiner-Elements is incredibly flexible, but managing complex key remaps by
hand is error-prone. A single typo or duplicate mapping can break your setup.
This editor focuses on discoverability and guard rails so you can experiment
with complex manipulations while always knowing the resulting JSON's shape.

## Features

- **Complex Modification Builder** — Compose manipulators with drag-and-drop
  ordering, inline search, modifier helpers, condition builders, and conflict
  detection.
- **Rule Templates** — Drop in common Karabiner recipes (Hyper key, Vim
  navigation, Caps Lock remaps) as a starting point.
- **Simple & Fn Key Editors** — Easily remap simple modifications and function
  keys at the profile or device level.
- **Live Preview & Export** — See the generated JSON at all times, copy to
  clipboard, or download a validated `karabiner.json`.
- **Validation** — Real-time validation with error and warning detection before
  export.
- **Dark Mode** — Toggle between light and dark themes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/zkwokleung/karabiner-config-editor.git
cd karabiner-config-editor

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typical Workflow

1. **Import** — Upload your existing `karabiner.json` file, paste raw JSON, or
   start with a default config.
2. **Edit** — Use the visual editors to modify profiles, simple modifications,
   Fn keys, and complex rules.
3. **Export** — Resolve any validation issues, then copy or download the
   generated JSON.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router and React 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) with
  [shadcn/ui](https://ui.shadcn.com/) components
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for
  form handling
- [@dnd-kit](https://dndkit.com/) for drag-and-drop functionality

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme providers
│   ├── page.tsx            # Main import → edit → export workflow
│   └── globals.css         # Global styles
├── components/
│   ├── profile/            # Profile, device, and Fn key editors
│   ├── ui/                 # shadcn/ui primitives
│   ├── complex-modifications-editor.tsx
│   ├── condition-editor.tsx
│   ├── rule-templates.tsx
│   └── to-event-editor.tsx
├── hooks/
│   └── use-toast.ts        # Toast notifications
├── lib/
│   ├── validation.ts       # Config validation and conflict detection
│   ├── default-config.ts   # Default Karabiner config generator
│   ├── karabiner-keycodes.ts
│   └── utils.ts
└── types/
    ├── karabiner.ts        # Karabiner-Elements type definitions
    └── profile.ts
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

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com/). Every
push to the main branch triggers a production build.

## Contributing

Issues and feature requests are welcome! When proposing changes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. See the repository for license details.

## Acknowledgments

- [Karabiner-Elements](https://karabiner-elements.pqrs.org/) by pqrs.org
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
