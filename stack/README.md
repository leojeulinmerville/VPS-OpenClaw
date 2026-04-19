# Durable Stack

This directory is the durable execution stack for long-running or resumable work.

## Goals

- Persist task state outside session memory
- Allow bounded autonomous resumption after token exhaustion, restarts, or detached wakes
- Keep one clear source of truth per task

## Layout

- `INBOX.md` — lightweight intake surface for raw durable work
- `tasks/` — one file per normalized task
- `queue.json` — lightweight index of active tasks
- `runner-notes.md` — execution contract for future wakes

## Task file contract

Each task file should contain:

- id
- title
- status
- priority
- owner session/context
- current step
- done
- remaining
- exact next action
- blocked on
- retry condition
- last update time
- resume policy
- optional linked sessions / child tasks

## Status values

- `TODO`
- `RUNNING`
- `WAITING_INPUT`
- `WAITING_RETRY`
- `DONE`
- `CANCELLED`

## Inbox normalization

Raw work can land in `INBOX.md` first.

Normalization rule:

1. Create one task file under `tasks/`
2. Copy the intent into a proper task structure
3. Set a priority and initial status
4. Add or update the task entry in `queue.json`
5. Mark the inbox item as migrated, or remove it once captured elsewhere

After normalization, `tasks/` and `queue.json` become the durable source of truth.

## Execution rules

On an autonomous wake:

1. Read `queue.json`
2. Pick the highest-priority resumable task
3. Read only the relevant task file
4. Execute one bounded step or one tight batch
5. Update the task file immediately
6. Update `queue.json`
7. If done, mark `DONE` and optionally notify Operator
8. If blocked, mark the exact blocker

Do not rely on conversational memory as the source of truth.
