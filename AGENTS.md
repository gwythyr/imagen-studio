# Repository Guidelines

## Project Structure & Module Organization
The React client lives in `src/`, with feature components paired to hooks under `src/hooks/` to orchestrate data coming from services. Database access must stay inside the Web Worker at `src/lib/database.worker.ts`, while the services in `src/lib/database/` expose raw SQLite rows for downstream transformation. Shared chat contracts belong in `src/types/chat.ts`, and Gemini streaming is handled in `src/lib/geminiMessageProcessor.ts`. Keep `public/sql-wasm.wasm` and `public/coi-serviceworker.js` versioned; together with the `/imagen-studio/` base in `vite.config.ts` they enable OPFS persistence across GitHub Pages deployments.

## Build, Test, and Development Commands
- `npm install` – install project dependencies and the SQLite WASM bundle.
- `npm run dev` – start the Vite dev server with the COOP service worker.
- `npm run build` – type-check then produce the production bundle under `dist/`.
- `npm run preview` – serve the built bundle locally to mirror GitHub Pages.
- `npm run lint` – run ESLint across the workspace.

## Coding Style & Naming Conventions
Use TypeScript modules with ES imports, two-space indentation, and semicolons omitted to match the existing source. React components and hooks follow `PascalCase` and `useCamelCase` respectively, while workers and services end with `.worker.ts` and `Service.ts`. Always reuse the interfaces in `src/types/chat.ts` rather than inlining shapes, and generate IDs with `crypto.randomUUID()`. Avoid try/catch; allow errors to surface so the calling hook or boundary can decide how to recover.

## Testing Guidelines
Automated tests are not yet wired in; when introducing them, colocate `*.test.ts` alongside the feature or service and drive worker interactions with Vitest’s browser-compatible runners. Exercise new hooks through scenario-based tests that mock structured worker messages, and verify OPFS persistence manually in Chrome with the Application tab until headless coverage exists. Document any limitations in the pull request so regression checks remain reproducible.

## Commit & Pull Request Guidelines
Follow the short, imperative commit style already in history (e.g., `fix build`, `add opfs headers`). Squash or rebase before opening a PR, and describe the observable change, affected modules, and manual checks performed. Link issues, upload UI screenshots or logs when behavior changes, and call out database migrations or worker protocol updates so reviewers can retest with a clean profile.
