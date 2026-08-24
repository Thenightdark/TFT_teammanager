# TFT Team Helper

A local desktop helper for manually selecting TFT champions and items, then comparing them with stored team compositions.

## Development

```powershell
pnpm install
.\node_modules\.bin\tauri.cmd dev
```

On Windows, install Visual Studio Build Tools with the **Desktop development with C++** workload before the first native build.

## Updating TFT data

The app discovers set folders automatically. To import or refresh a set:

```powershell
pnpm data:update -- --set 17 --name "Set 17: Space Gods"
```

The updater creates the set's champion, item, trait, composition, and local image data, then registers the set in `src/data/sets.json`.

The app is intentionally separate from League of Legends. It does not inspect processes, read game memory, inject code, automate inputs, modify game files, or interact with Vanguard.

## Current milestone

- React + TypeScript + Vite frontend
- Tauri 2 desktop shell
- Typed, independently stored Set 16 and Set 17 data
- Real champion, item, and trait images with lazy loading and fallbacks
- Champion search, cost filters, selection, removal, and duplicate prevention
- Duplicate-aware item inventory and component recipe matching
- Deterministic, explainable composition recommendations and detail views
- Live trait counts and an in-app active-set selector
- Searchable Radiant and Artifact guide with set-specific holder suggestions
- Three early/mid/late positioning boards and five augment fits per composition
- Saved champion, item, and set selections with new-game/reset controls
- Compact settings for set, grid size, champion names, and saved data
- Defensive data validation and recommendation-engine tests

Run the automated tests with:

```powershell
pnpm test
```

## Windows production package

Create the release executable and NSIS installer with:

```powershell
pnpm tauri build
```

The release executable is written to `src-tauri/target/release`, and the installer is written to `src-tauri/target/release/bundle/nsis`.
