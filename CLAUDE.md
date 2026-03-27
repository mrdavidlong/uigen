# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests with Vitest
npm run db:reset     # Reset SQLite database
```

All `next` commands require `NODE_OPTIONS='--require ./node-compat.cjs'` (already embedded in npm scripts).

To run a single test file:
```bash
npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts
```

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates code that renders instantly in an iframe.

### Request Flow

1. User submits a chat message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Server streams a response from Claude with two tools available:
   - `str_replace_editor` — create/replace/insert in files
   - `file_manager` — rename/delete files
3. Tool calls are streamed to the client and handled by `FileSystemContext`
4. `PreviewFrame` watches `FileSystemContext`, runs Babel transforms on all files, builds an import map with blob URLs, and writes an `<iframe>` srcdoc
5. On stream completion, the server serializes the file system and messages to the SQLite DB (if `projectId` is present)

### State Management

Two React contexts live in `src/lib/contexts/`:

- **`FileSystemContext`** — wraps a `VirtualFileSystem` instance (`src/lib/file-system.ts`). Exposes file CRUD, selected file, and a `handleToolCall` method that the chat layer calls when AI tool results arrive.
- **`ChatContext`** — wraps the Vercel AI SDK `useChat` hook. Forwards tool call results to `FileSystemContext`.

Both contexts are provided in `src/app/main-content.tsx`, which also owns the three-panel layout (chat | file tree + editor | preview).

### JSX Transformation Pipeline

`src/lib/transform/jsx-transformer.ts` powers the live preview:

- `createImportMap(files)` — Babel-transforms all JS/TS files into blob URLs, maps npm packages to `esm.sh`, resolves `@/` aliases, collects CSS
- `createPreviewHTML(entryPoint, importMap, styles, errors)` — builds the full iframe HTML with Tailwind CDN, an error boundary, and a React mount point

Entry point detection order: `/App.jsx`, `/App.tsx`, `/index.jsx`, `/index.tsx`.

### Database

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

Prisma with SQLite (`prisma/dev.db`). Two models:

- **`User`** — email + bcrypt password, owns many Projects
- **`Project`** — stores `messages` (JSON string) and `data` (serialized `VirtualFileSystem` nodes); `userId` is nullable for anonymous sessions

Server actions in `src/actions/` handle all DB access. Authentication uses JWT via `jose` stored in an HTTP-only cookie.

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | AI streaming endpoint; tool definitions |
| `src/lib/contexts/file-system-context.tsx` | Virtual FS state + tool call handler |
| `src/lib/contexts/chat-context.tsx` | Chat state + AI SDK integration |
| `src/components/preview/PreviewFrame.tsx` | Iframe preview + JSX transform invocation |
| `src/lib/transform/jsx-transformer.ts` | Babel transform + import map generation |
| `src/lib/file-system.ts` | In-memory virtual file system class |
| `src/lib/prompts/generation.tsx` | System prompt sent to Claude |
| `src/app/main-content.tsx` | Root client layout; context providers |

## Code Style

- Use comments sparingly. Only comment complex/non-obvious code.

## Tech Stack Notes

- **Next.js 15** App Router; server components at the page level, client components for all interactive UI
- **Tailwind CSS v4** — config is in `postcss.config.mjs`, not `tailwind.config.js`
- **shadcn/ui** components are in `src/components/ui/` (style: `new-york`)
- Path alias `@/` maps to `src/`
- Tests use Vitest + jsdom + Testing Library; config is in `vitest.config.mts`
