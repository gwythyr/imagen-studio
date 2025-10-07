# Code Mode Rules (Non-Obvious Only)

- Database services MUST NOT contain mapping/transformation logic - keep in hooks/components only
- Worker messages require exact `{type: string, payload: any}` structure or operations fail silently
- Images stored as BLOBs require base64 conversion in `ImageService.create()` before database storage
- SQLite operations must check `connection.isInitialized` before proceeding
- No try/catch blocks allowed - project uses natural error bubbling pattern
- Use defined interfaces from `src/types/chat.ts` - inline parameter types violate project standards
- `crypto.randomUUID()` required for all IDs - other generators cause database conflicts
- Service layer separation is strict - data transformation only in hooks/components layer
- Content sanitization in `MessageService` removes null bytes and unicode replacement chars