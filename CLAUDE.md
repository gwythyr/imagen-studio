# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Architecture

React + TypeScript chat application with local SQLite storage using Worker-based database architecture:

- `src/types/` - TypeScript interfaces for chat data
- `src/lib/database/` - Database services and connection management
- `src/lib/database.worker.ts` - Web Worker for SQLite operations
- `src/services/` - Business logic layer (LLM service)
- `src/hooks/` - Custom React hooks for data management
- `src/components/` - React UI components
- `@sqlite.org/sqlite-wasm` for in-browser SQLite database
- Google Generative AI SDK for LLM integration
- Local OPFS persistence for chat history

## Key Patterns

- **Database Architecture**: All SQLite operations run in a Web Worker for performance
- **Service Layer**: Database services (`SessionService`, `MessageService`, `ImageService`, `SettingsService`) handle data operations
- **Custom Hooks**: Use hooks like `useChat`, `useMessages`, `useAiInteraction` for reactive data binding
- **Data Storage**: Store chat messages and images as BLOBs in SQLite with OPFS persistence
- **ID Generation**: Use `crypto.randomUUID()` for message/session IDs
- **API Integration**: Direct Gemini API calls from browser with structured response handling
- **Error Handling**: No try/catch blocks - let errors bubble up naturally
- **Component Design**: Keep components focused on single responsibility, separate UI from business logic
- **Type Safety**: No inline parameter types - use defined TypeScript interfaces from `src/types/`
- **Service Layer Rules**: No mapping operations in services - keep data transformation in hooks/components