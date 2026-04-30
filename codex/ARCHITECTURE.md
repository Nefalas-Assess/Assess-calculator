# Architecture

## Runtime layers

### 1. Electron main

File: `src/main/index.ts`

Responsibilities:

- creates the main `BrowserWindow`
- registers IPC handlers once
- manages filesystem access for open/save/read/write
- manages `electron-store`
- checks for app updates with `electron-updater`
- validates licenses through Supabase Edge Functions
- exposes custom reference dataset management
- handles printing

Notable detail:

- the main process imports `supabase` from `src/renderer/src/utils/supabase.ts`
- it also writes editable datasets directly under `src/renderer/src/data/custom`

### 2. Preload bridge

File: `src/preload/index.ts`

`window.api` is the renderer's bridge to privileged features:

- dialogs
- file read/write
- print
- update events
- `electron-store`
- license validation
- custom reference dataset CRUD

If a renderer feature needs Node/Electron access, it should usually be added here and implemented in `src/main/index.ts`.

### 3. Renderer

Main files:

- `src/renderer/src/main.tsx`
- `src/renderer/src/App.tsx`

The renderer is a React SPA wrapped in `HashRouter`.

Provider order:

1. `License`
2. `AppProvider`
3. `ToastProvider`
4. `SideProvider`
5. route tree

## Route map

Defined in `src/renderer/src/App.tsx`.

- `/` home: create or import a case file
- `/infog` general information
- `/frais` general costs
- `/it/*` temporary incapacity
- `/ip/*` permanent incapacity
- `/deces/*` death-related prejudice
- `/provisions`
- `/recap`
- `/prejudice_scolaire`
- `/settings/*` custom reference dataset management

The settings route exists, but the header button is commented out in `src/renderer/src/layouts/HeaderLayout.tsx`. Today it is reachable only by direct navigation to `#/settings`.

## UI shell

### Header

File: `src/renderer/src/layouts/HeaderLayout.tsx`

Responsibilities:

- dark/light mode toggle
- manual save
- back to home
- language switch

### Side navigation

File: `src/renderer/src/layouts/AppLayout.tsx`

Responsibilities:

- section navigation
- missing prerequisite checks before entering some flows
- error badge counts from validation
- update toasts
- recent files panel

## State model

### AppProvider

File: `src/renderer/src/providers/AppProvider.tsx`

Main responsibilities:

- stores the current case data in `data`
- stores validation errors in `errors`
- stores the active file path
- saves JSON to disk
- computes derived values such as `computed_info.age_consolidation`
- injects defaults from `general_info.config`
- loads available reference types, including custom datasets

Important behavior:

- `setData` merges the incoming partial payload into the existing case object
- validation runs centrally after each update
- save writes `version` into the JSON through `prepareDataForSave`

### Form pattern

Typical screen flow:

1. page component reads `data` from `AppContext`
2. page component renders one form module
3. form uses `react-hook-form`
4. form autosubmits on change
5. page component stores the result with `setData({ some_key: values })`

Representative example:

- page: `src/renderer/src/components/incapacite_temporaire/personnel.tsx`
- form: `src/renderer/src/form/incapacite_temp/personnel.tsx`

## Generic engines

### Dynamic table

File: `src/renderer/src/generic/dynamicTable.tsx`

This is the main reusable engine for the calculation screens.

It supports:

- field arrays
- computed days
- computed totals
- interests
- capitalization coefficient display
- reference selectors
- row-level validation display

If a task touches table behavior, start here before editing individual forms.

### Translation

Files:

- `src/renderer/src/traduction.js`
- `src/renderer/src/generic/textItem.tsx`

Translations are key-based. Missing keys fall back to the key string itself.

## Persistence and imports

### Case files

Hook: `src/renderer/src/hooks/recentFiles.tsx`

Behaviors:

- create new case file
- import existing JSON
- migrate JSON on load
- track recent files in `electron-store`

### Migrations

Files:

- `src/renderer/src/utils/migrations.ts`
- `src/renderer/src/utils/migration/*`

Imported files are upgraded to the current app version before entering the UI.

## Licensing and updates

### Licensing

Files:

- renderer gate: `src/renderer/src/License.tsx`
- main IPC: `src/main/index.ts`

The app checks a cached license first, then falls back to Supabase when online.

### Updates

File: `src/main/index.ts`

`electron-updater` emits events to the renderer, and `ToastProvider` displays progress and restart actions.
