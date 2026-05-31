# Creg AI — AI Coding Assistant

![Vite Build](https://img.shields.io/badge/built%20with-Vite-yellow)

Creg AI is a web-based AI pair programmer that helps developers generate, debug,
refactor, and optimize code. The app provides an interactive chat interface,
syntax-highlighted code blocks, quick prompts, language selection, and
integrations for authentication and backend services. It ships as a modern
React + Vite + TypeScript starter with Tailwind CSS and shadcn/ui components.

## Features

- **AI Chat**: Interactive assistant for natural-language programming help,
	code generation, and debugging guidance.
- **Code Blocks**: Syntax highlighted, copyable code snippets and examples.
- **Quick Prompts**: Preset prompts for common workflows (refactor, tests,
	bug triage, performance tuning).
- **Language Selector**: Choose language/formatting for generated code.
- **Auth Integration**: Example Supabase auth flow and optional Lovable auth
	connector.
- **Serverless Function Example**: A sample Supabase function lives in
	`supabase/functions/chat/`.
- **Testing & E2E**: Unit tests with Vitest and Playwright configuration for
	end-to-end tests.
- **Deployment Ready**: Static build with `vite build` for hosting on Vercel,
	Netlify, or GitHub Pages.

## Quick Start

Prerequisites

- Node.js 18+ and npm installed

Install

```bash
cd CREG-AI/CREG-AI
npm install
```

Run (development)

```bash
npm run dev
# open http://localhost:8080/
```

Build (production)

```bash
npm run build
npm run preview
```

Testing

```bash
npm run test
npm run test:watch
```

## Environment Variables

Create a `.env` file at the project root with keys required by integrations.
Common variables (example names):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Lovable / OAuth client IDs and secrets as needed

Do not commit secrets to source control. A `.env` placeholder exists in the
repository — replace values locally.

## Project Structure (high level)

- `src/` — React app source, components, and pages (`src/main.tsx`, `src/App.tsx`).
- `src/components/` — UI and chat components.
- `src/pages/` — Top-level page components (`Chat`, `Auth`, `Index`).
- `supabase/` — Example serverless functions and migrations.
- `docs/` — Static deploy artifacts (used for GitHub Pages or demos).
- `public/` — Static public assets.

## Deployment

Static hosts (Vercel / Netlify / GitHub Pages) are supported. Use:

- Build command: `npm run build`
- Publish directory: `dist`

Tip: Run `npm run preview` locally to verify the production build.

## Contributing

1. Fork or branch from `master`.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make changes, add tests, and run `npm run test`.
4. Commit and push, then open a Pull Request.

Commit example

```bash
git add .
git commit -m "feat: add short description"
git push origin HEAD
```

## Troubleshooting

- If `npm run dev` fails on Windows PowerShell due to execution policy, use
	`npm.cmd run dev` or run the project in a Node-enabled shell.
- If a dependency is missing, run `npm install` to install packages.
- Check browser devtools (F12) → Console/Network for runtime errors.

## License

This repository does not include a license file by default. Suggested: MIT.
Add a `LICENSE` file with your preferred license.

## Contact

- Maintainer: shashidharashadapu348@gmail.com
- Repository: https://github.com/shashidharashadapu348-hub/CREG-AI

---

If you want, I can also:

- Add or update a `LICENSE` file.
- Add setup instructions for Supabase and Lovable integrations.
- Generate badges (build/test/coverage) for the top of this `README`.

TODO: Document your project here
