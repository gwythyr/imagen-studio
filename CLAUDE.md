# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Architecture

React + TypeScript chat application with local SQLite storage:

- `src/types/` - TypeScript interfaces for chat data
- `src/lib/` - Database and API utilities
- `src/components/` - React components
- SQL.js for in-browser SQLite database
- Google Generative AI SDK for LLM integration
- Local storage persistence for chat history

## Key Patterns

- Store chat messages and images as BLOBs in SQLite
- Use crypto.randomUUID() for message/session IDs
- Direct Gemini API calls from browser
- No try/catch blocks - let errors bubble up
- Keep components simple and focused on single responsibility
- separate concerns, don't mix logic with ui and styles, follow best react practices for this