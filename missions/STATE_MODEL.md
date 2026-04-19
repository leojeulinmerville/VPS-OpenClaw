# Mission State Model

## Files

- `missions/registry.json` — compact global mission index
- `missions/state/<mission_id>.json` — per-mission durable operational state

## Registry purpose

Use the registry to:
- list missions quickly
- select resumable missions
- avoid reading every state file on every wake

## State purpose

Use each mission state file to:
- resume exact mission progress after interruption
- store the minimal operational truth
- track current step, next action, blockers, and pointers

## Required mission state fields

- `mission_id`
- `channel`
- `thread_ts`
- `title`
- `goal`
- `status`
- `priority`
- `summary`
- `current_step`
- `next_action`
- `blocked_on`
- `retry_after`
- `external_artifacts`
- `external_doc_urls`
- `drive_root`
- `created_at`
- `updated_at`
- `last_update`
- `last_progress_note`
- `resume_count`
- `channel`
- `thread_ts`

## Status values

- `new`
- `running`
- `waiting_input`
- `waiting_retry`
- `review`
- `done`
- `failed`
- `cancelled`
