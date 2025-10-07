# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Architecture

- SQLite WASM database runs in Web Worker (`src/lib/database.worker.ts`) - ALL database operations must go through worker
- OPFS (Origin Private File System) persistence requires COOP headers - handled by `public/coi-serviceworker.js`
- Database services return raw data - NO mapping/transformation in services (violates project rules)
- Use `crypto.randomUUID()` for all ID generation (sessions, messages)
- `vite.config.ts` base path set to `/imagen-studio/` for GitHub Pages deployment

## Non-Standard Patterns

- Images stored as BLOBs in SQLite with base64 encoding/decoding in `ImageService`
- Worker communication uses structured message format with `type` and `payload`
- Database connection MUST be initialized before any service operations
- No try/catch blocks - errors bubble up naturally (project convention)
- Service layer strictly separated from data transformation (done in hooks/components)
- Content sanitization in `MessageService` removes null bytes and unicode replacement chars

## Critical File Locations

- `src/types/chat.ts` - Core TypeScript interfaces (use these, no inline types)
- `src/lib/database/` - Database services (SessionService, MessageService, ImageService, SettingsService)
- `src/hooks/` - Custom hooks for reactive data binding with services
- `src/lib/geminiMessageProcessor.ts` - Handles Gemini API response streaming and processing

## Development Setup

- SQLite WASM file must be in `public/sql-wasm.wasm`
- Service worker required for COOP headers in development
- Direct Gemini API calls from browser (no backend proxy)
- Worker format set to 'es' in vite config for proper ES module support
- `@sqlite.org/sqlite-wasm` excluded from Vite optimization