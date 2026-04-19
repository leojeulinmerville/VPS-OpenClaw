# Mission Folder Architecture

## Root

Google Drive root:
- `Agent Missions/`

## Top-level folders

- `missions/` — one folder per mission
- `inbox/` — documents uploaded by Operator before sorting
- `shared-resources/` — reusable reference docs, templates, assets
- `archives/` — completed or frozen mission bundles

## Per-mission layout

Path:
- `Agent Missions/missions/<mission_id>/`

Recommended subfolders:
- `01-input/` — briefs, raw docs, user uploads, source files
- `02-working/` — drafts, intermediate exports, generated working files
- `03-deliverables/` — final outputs to share or keep
- `04-assets/` — images, PDFs, attachments, supporting media
- `05-admin/` — mission notes, checklists, metadata exports if needed

## Naming

Mission folder:
- `<mission_id>/`

Artifact naming:
- `<yyyy-mm-dd>_<kind>_<basename>`

Examples:
- `2026-04-13_brief_scope-notes.md`
- `2026-04-13_source_client-deck.pdf`
- `2026-04-13_final_landing-page-copy.md`

## Principles

- Drive stores durable mission material.
- Local workspace stores only minimal mission state and pointers.
- Inbox documents should be normalized into a mission folder quickly.
- Final deliverables should live in `03-deliverables/`.
