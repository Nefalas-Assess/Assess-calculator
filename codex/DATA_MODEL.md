# Data Model

## Top-level case object

`AppContext.data` is the current case file. It is saved as JSON with a `version` field.

Common top-level keys observed in the code:

- `version`
- `computed_info`
- `general_info`
- `frais`
- `provisions`
- `prejudice_scolaire`
- `incapacite_temp_personnel`
- `incapacite_temp_menagere`
- `incapacite_temp_economique`
- `efforts_accrus`
- `hospitalisation`
- `pretium_doloris`
- `forfait_ip`
- `incapacite_perma_personnel_cap`
- `incapacite_perma_menage_cap`
- `incapacite_perma_economique_cap`
- `incapacite_perma_charges`
- `prejudice_particulier`
- `frais_funeraire`
- `prejudice_exh`
- `prejudice_proche`

## `general_info`

Entry point:

- page: `src/renderer/src/components/general/infog.tsx`
- form: `src/renderer/src/form/info_general/form/index.tsx`

Important subfields:

- victim identity and dates
- `sexe`
- `statut`
- `profession`
- `children`
- `note`
- `calcul_interets`
- `economique.brut` and `economique.net`
- `config.*`
- `ip.personnel|menagere|economique`

Important config defaults:

- `default_contribution`
- `date_paiement`
- `incapacite_perso`
- `hospitalisation`
- `incapacite_menagere`
- `person_charge`
- `effort_accrus`
- `km_vehicule`
- `km_other`
- `prejudice_exh`

Derived fields written by `AppProvider`:

- `computed_info.age_consolidation`
- `computed_info.rate`

## Screen-to-key mapping

Use this when a task mentions a functional area.

- General info: `general_info`
- General costs: `frais`
- Provisions: `provisions`
- School prejudice: `prejudice_scolaire`
- Temporary incapacity, personal: `incapacite_temp_personnel`
- Temporary incapacity, domestic: `incapacite_temp_menagere`
- Temporary incapacity, economic: `incapacite_temp_economique`
- Increased effort: `efforts_accrus`
- Hospitalization: `hospitalisation`
- Pretium doloris: `pretium_doloris`
- Permanent incapacity, forfait: `forfait_ip`
- Permanent incapacity, personal capitalization: `incapacite_perma_personnel_cap`
- Permanent incapacity, domestic capitalization: `incapacite_perma_menage_cap`
- Permanent incapacity, economic capitalization: `incapacite_perma_economique_cap`
- Permanent incapacity, charges: `incapacite_perma_charges`
- Special prejudice: `prejudice_particulier`
- Funeral costs: `frais_funeraire`
- Ex haeredes prejudice: `prejudice_exh`
- Relatives prejudice: `prejudice_proche`

## Reference tables

Main source folder:

- `src/renderer/src/data/schryvers`

Available template folders currently present:

- `Blank`
- `2024`
- `2025`
- `2026`

Observed convention:

- each annual Schryvers folder contains about `101` files
- file naming rules are documented in `src/renderer/src/data/file_names.txt`

Reference type values exposed to the UI:

- built-in values such as `schryvers_2024`, `schryvers_2025`
- custom values in the shape `custom_<datasetId>`

## Capitalization lookup flow

Main hook:

- `src/renderer/src/hooks/capitalization.tsx`

How it works:

1. reads the selected reference string
2. splits it into source/year/sheet parts
3. dynamically imports the matching TSX module from `@renderer/data/...`
4. interpolates between yearly rows based on age and day offset

If a capitalization coefficient is wrong, inspect:

- the selected reference string
- the target data module under `src/renderer/src/data/schryvers`
- `useCapitalization`
- the consuming table column config

## Custom datasets

Managed from:

- `src/main/index.ts`
- `src/renderer/src/components/settings/*`

Storage folder:

- `src/renderer/src/data/custom/<datasetId>/`

Each dataset can contain:

- copied `.tsx` table files
- `meta.json`

Creation flow:

1. the main process copies a source template folder, defaulting to `Blank`
2. it writes `meta.json`
3. the renderer lists the custom dataset as a new reference type

## Validation

Central file:

- `src/renderer/src/helpers/validation.ts`

Current validation is intentionally narrow and mostly checks:

- start dates before `general_info.date_accident`
- provisions that should remain negative

UI error badges and cell-level markers rely on these centralized keys.
