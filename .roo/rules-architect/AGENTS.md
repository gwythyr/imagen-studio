# Architecture Mode Rules (Non-Obvious Only)

- Worker boundary enforces service layer purity - prevents accidental coupling with UI state
- OPFS provides persistence but requires specific browser security context (COOP headers)
- Database services designed stateless - worker handles connection state management
- React hooks layer intentionally handles all data transformation to maintain service purity
- Gemini API calls direct from browser - no backend proxy pattern used
- Image storage as BLOBs in SQLite avoids filesystem complexity but requires base64 handling
- Service worker enables COOP headers for development - production needs server configuration
- Worker communication pattern prevents sharing complex objects - forces serializable interfaces
- `vite.config.ts` excludes `@sqlite.org/sqlite-wasm` from optimization to prevent bundling issues