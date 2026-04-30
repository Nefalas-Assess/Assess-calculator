# Maintenance Notes

## How to add or change a calculation screen

Typical workflow:

1. create or update the page component in `src/renderer/src/components/...`
2. create or update the form in `src/renderer/src/form/...`
3. store values through `setData({ target_key: values })`
4. register the route in `src/renderer/src/App.tsx`
5. add the nav link in `src/renderer/src/layouts/AppLayout.tsx`
6. add translation keys in `src/renderer/src/traduction.js`
7. if totals or recap output matter, update `src/renderer/src/components/general/recapitulatif.tsx`
8. if new validation is needed, update `src/renderer/src/helpers/validation.ts`

## How to add a new migration

1. add a file under `src/renderer/src/utils/migration/`
2. register it in order in `src/renderer/src/utils/migrations.ts`
3. keep the migration id equal to the target app version
4. test by importing an older JSON file

Current migrations:

- `0.3.0`
- `1.1.0`
- `1.2.1`

## How to add a new Schryvers year

1. create a new folder under `src/renderer/src/data/schryvers/<year>`
2. follow the naming conventions in `src/renderer/src/data/file_names.txt`
3. add the new built-in option to `reference_type` in `src/renderer/src/constants.tsx`
4. verify dynamic imports still resolve from `useCapitalization`

## How to debug custom reference editing

Main code paths:

- main process dataset CRUD: `src/main/index.ts`
- dataset overview: `src/renderer/src/components/settings/SettingsOverview.tsx`
- file editor: `src/renderer/src/components/settings/SettingsEditor.tsx`

Behavior notes:

- only `.tsx` files are editable
- dataset ids are restricted to letters, digits, `_` and `-`
- module content is parsed from `export default ...`
- unsupported file shapes fall back to raw content mode

## Packaging and release

Main files:

- `package.json`
- `electron-builder.yml`

Useful scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm build:mac`
- `pnpm build:win`
- `pnpm build:linux`
- `pnpm publish`

Environment variables used by the project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GH_TOKEN`

## Known risks and quirks

### Hardcoded GitHub token

`electron-builder.yml` currently contains a GitHub token value directly in the file.

Recommended fix:

- move publishing credentials to environment variables only
- rotate the exposed token

### Settings route is not reachable from the visible UI

The route exists, but the header button is commented out.

Impact:

- custom dataset tooling may look "missing" to someone testing the app manually

### Main process depends on renderer-side modules

Examples:

- `src/main/index.ts` imports `src/renderer/src/utils/supabase.ts`
- custom dataset files are edited inside the renderer source tree

Impact:

- boundaries are convenient but not clean
- packaging or future refactors can break these cross-layer assumptions

### No automated test suite found

Observed scripts cover:

- lint
- typecheck
- build

Impact:

- regression checking is mostly manual

### Validation is centralized but shallow

Most business validation lives in one file and currently covers only a subset of business rules.

Impact:

- some incorrect states can still be saved unless individual forms prevent them

## Recommended "first files" by task

- save/import issue: `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/hooks/recentFiles.tsx`
- broken route or nav: `src/renderer/src/App.tsx`, `src/renderer/src/layouts/AppLayout.tsx`
- wrong total in a table: target form file, `src/renderer/src/generic/dynamicTable.tsx`
- wrong capitalization coefficient: `src/renderer/src/hooks/capitalization.tsx`, target Schryvers file
- wrong translation: `src/renderer/src/traduction.js`, `src/renderer/src/generic/textItem.tsx`
- migration/import bug: `src/renderer/src/utils/migrations.ts`, `src/renderer/src/utils/migration/*`
- custom reference editor bug: `src/main/index.ts`, `src/renderer/src/components/settings/*`
