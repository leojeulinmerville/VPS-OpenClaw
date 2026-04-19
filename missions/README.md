# Missions

This directory holds the minimal local control plane for mission tracking.

## Files

- `artifact-backends.json` — backend configuration
- `registry.json` — compact global mission index
- `state/` — one durable JSON state file per mission
- `STATE_MODEL.md` — minimal durable state contract
- `UPLOAD_CONVENTION.md` — naming and Drive layout rules
- `FOLDER_ARCHITECTURE.md` — Google Drive mission folder structure
- `UPLOAD_LOGIC.md` — intake and routing logic for Operator uploads
- `scripts/create-mission.js` — create mission state + registry entry
- `scripts/set-mission.js` — update mission state fields
- `scripts/pick-next-mission.js` — select the next resumable mission
- `scripts/run-mission-step.js` — minimal cron-oriented mission picker/resumer
- `scripts/log-incident.js` — append a structured operational incident entry for recurring blockers or failures
- `scripts/migrate-registry.js` — upgrade registry entries and backfill state files
- `scripts/normalize-slack-mission.js` — normalize free-form Slack mission text into a mission card
- `scripts/create-slack-mission-from-text.js` — create a durable mission directly from Slack text
- `scripts/render-slack-mission-card.js` — render a Slack-ready mission summary from mission state
- `scripts/render-and-queue-mission-card.js` — render a Slack mission card and queue it durably in the outbox
- `scripts/flush-slack-outbox.js` — flush pending Slack outbox entries and mark them sent or failed
- `scripts/ingest-slack-file.sh` — publish a Slack-downloaded file into mission input storage
- `scripts/upload-artifact.sh` — upload one artifact to Drive
- `scripts/register-artifact.js` — register uploaded artifact in the local registry
- `scripts/publish-artifact.sh` — upload + register in one step

## Happy path

1. Create a mission:
   - `node missions/scripts/create-mission.js <mission_id> <channel> <thread_ts> <title> <goal> [priority]`
2. Set or refine state when the mission progresses:
   - `node missions/scripts/set-mission.js <mission_id> <field> <value> [<field> <value> ...]`
3. Publish an artifact when needed:
   - `missions/scripts/publish-artifact.sh <mission_id> <file_path> [artifact_kind]`
4. On cron or resume, pick one mission step:
   - `node missions/scripts/run-mission-step.js`
5. Post useful updates in the Slack mission thread

## Principle

Drive stores the durable artifacts.
The VPS stores only lightweight mission state and pointers.

Operational incident learning belongs here too:
- `INCIDENTS.md` is the human-readable rule surface
- `incidents.jsonl` is the append-only structured log
- repeated blockers should feed back into mission scripts, local rules, or skills

The mission picker should prefer actionable missions and skip entries already marked as blocked or waiting on input.

Note: the publish script currently creates a public share link for the uploaded artifact.
The cron-facing mission resumer currently selects and checkpoints a mission cleanly; deeper autonomous execution can now build on this state store.
