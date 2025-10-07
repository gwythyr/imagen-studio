# Debug Mode Rules (Non-Obvious Only)

- Worker errors don't appear in main thread console - check browser's Worker debugger
- OPFS database file location: `navigator.storage.getDirectory()` then `imagen-studio.sqlite3`
- COOP header issues manifest as "SharedArrayBuffer not defined" errors
- Database initialization failures cause silent service operation failures
- Gemini API streaming errors only visible in network tab, not console
- SQLite WASM loading failures appear as "Module not found" in service worker context
- Image BLOB corruption shows as database constraint errors, not image loading errors
- Service worker registration required for COOP headers - check `public/coi-serviceworker.js`