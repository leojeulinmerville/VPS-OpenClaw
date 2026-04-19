# Mission Upload Convention

## Drive layout

Remote:
- `gdrive:`

Root folder:
- `gdrive:Agent Missions`

Per-mission folder:
- `gdrive:Agent Missions/missions/<mission_id>/`

Default intake destination:
- `gdrive:Agent Missions/missions/<mission_id>/01-input/`

## Naming

Mission id should be stable and filesystem-safe.

Recommended artifact naming:
- `<yyyy-mm-dd>_<artifact-kind>_<basename>`

Examples:
- `2026-04-13_brief_product-strategy.md`
- `2026-04-13_export_wireframe-v2.pdf`
- `2026-04-13_asset_homepage-hero.png`

## Registry updates

For each uploaded artifact, add to `missions/registry.json`:
- `name`
- `local_path`
- `drive_path`
- `share_url`
- `uploaded_at`
- `kind`
- `source`
- `stage`

## Operating rule

Local files are working material or temporary cache.
Drive is the intended durable artifact store.
