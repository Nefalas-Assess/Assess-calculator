# Codex Project Notes

Snapshot reviewed on `2026-04-30`.

This folder is a working map of the project so future tasks can start from the right files without rescanning the whole repository.

## What this app is

`Evalix` is a desktop Electron app built with `electron-vite`, React and TypeScript.

It is a legal/insurance calculation tool centered on:

- general case information
- temporary incapacity
- permanent incapacity
- death-related prejudice
- recap/export of all calculated sections
- editable capitalization reference datasets

## Source of truth

Ignore generated folders unless the task is about packaging:

- source: `src/`
- build output: `out/`, `dist-electron/`, `dist/`
- packaged artifacts: `dist/`

## Fast entry points

Open these first depending on the task:

- app bootstrap: `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/App.tsx`
- navigation and shell UI: `src/renderer/src/layouts/AppLayout.tsx`, `src/renderer/src/layouts/HeaderLayout.tsx`
- global state: `src/renderer/src/providers/AppProvider.tsx`
- translations: `src/renderer/src/traduction.js`, `src/renderer/src/generic/textItem.tsx`
- file open/save and recents: `src/renderer/src/hooks/recentFiles.tsx`
- generic table engine: `src/renderer/src/generic/dynamicTable.tsx`
- data migrations: `src/renderer/src/utils/migrations.ts`
- custom reference editor: `src/renderer/src/components/settings/*`

## Where to read next

- high-level runtime and IPC: `ARCHITECTURE.md`
- business data shape and reference tables: `DATA_MODEL.md`
- maintenance rules and project risks: `MAINTENANCE.md`

## Common commands

```bash
pnpm dev
pnpm build
pnpm build:mac
pnpm build:win
pnpm typecheck
pnpm lint
```

## Important observations

- The renderer uses `HashRouter`, so routes are `#/...`.
- The app is gated by a license check before the main UI renders.
- JSON case files are versioned and migrated on import.
- Capitalization tables are loaded dynamically from `src/renderer/src/data/schryvers`.
- Custom reference sets are copied from template folders and edited through `/settings`, but the header button to open settings is currently commented out.
