# Ask Mode Rules (Non-Obvious Only)

- `src/lib/database/` contains service classes, not connection utilities (confusing naming)
- Worker architecture isolates SQLite from main thread - affects debugging and error visibility
- OPFS persistence requires specific browser security context (HTTPS or localhost)
- `src/services/llmService.ts` contains Gemini API integration, not generic LLM abstraction
- Database schema defined in worker initialization, not separate migration files
- Service layer intentionally thin - business logic resides in React hooks
- Cross-Origin-Embedder-Policy required for SharedArrayBuffer support (non-obvious requirement)
- Base path `/imagen-studio/` in vite config for GitHub Pages deployment affects routing