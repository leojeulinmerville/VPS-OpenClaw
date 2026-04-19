# Stack Runner Notes

This file is the standing contract for future Agent runs.

## Purpose

Resume durable work safely after interruption, token exhaustion, restart, or scheduled wake.

## Resume rule

- Prefer tasks with `status: RUNNING` or `WAITING_RETRY`
- Ignore `WAITING_INPUT` unless the required input has arrived
- Never resume `DONE` or `CANCELLED`

## Bounded-step rule

A wake should complete exactly one bounded task step, or one very small cluster of tightly related actions.

Examples:

- run one diagnostic command set
- edit one file or one coherent file batch
- verify one fix
- post one completion/blocker update

Do not silently continue indefinitely.

## Inbox rule

- `stack/INBOX.md` is allowed as a raw intake surface only
- do not execute durable work directly from inbox text
- normalize inbox items into `stack/tasks/*.md` before treating them as active execution units
- once normalized, mark the inbox item as migrated or remove it

## Update rule

After every bounded step, update:

- the task markdown file
- `stack/queue.json`
- daily memory when the change matters

If `stack/queue.json` and a task file disagree, treat the task file as the source of truth for that task and repair the queue immediately.

## Mission rule

For Slack durable missions, use:
- `missions/registry.json` as the compact selection index
- `missions/state/<mission_id>.json` as the per-mission operational truth
- Google Drive as the durable document store

Do not rely on rereading the full Slack thread as the primary resume mechanism.

## Notification rule

Notify Operator when:

- a task completes
- a task is blocked on Operator
- a task hits a meaningful failure
- a task materially changes direction

## Incident learning rule

After any meaningful bug, provider failure, sandbox issue, permission block, or workflow mistake:

- append the incident or lesson to `missions/incidents.jsonl` when the pattern is operational
- update the relevant task or mission state with the new preferred next step
- write the durable lesson into `memory/YYYY-MM-DD.md` when it should survive the local task
- when the pattern is recurring, sharpen a local rule or script so the same waste does not repeat

## Priority heuristic

1. explicit Operator priority
2. tasks already in progress
3. unblockers for other tasks
4. cheap high-value cleanup

## Safety

- Do not take destructive actions without confirmation
- Do not send external messages in Operator's name without instruction
- Prefer recoverable edits and explicit checkpoints
