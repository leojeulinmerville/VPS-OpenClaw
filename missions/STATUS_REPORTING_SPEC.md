# Status Reporting Spec

## Goal

Provide Operator with regular, compact operational updates about Agent's active mission work.

## Reporting cadence

Recommended cadence:
- every 10 minutes when there is active mission work
- immediate update on completion, blocker, failure, or major direction change
- stay quiet when nothing changed materially

## Report content

Each report should include:
- current mission(s) being worked on
- current step
- next action
- blockers
- active runtime/agent mode
- token/context pressure when available
- notable new artifacts or links

## Recommended format

- Active mission
- Current step
- Next action
- Status
- Tokens/context
- Agent mode
- New artifact/link (if any)

## Operational rules

- Do not flood Slack when nothing changed
- Prefer compact status over long prose
- Report per 10-minute window only if there is real progress or a real blocker
- Use local mission state as the source of truth, not memory alone

## Phase 1 implementation

1. Create durable reporting mission
2. Define report format
3. Add a small status snapshot script
4. Optionally attach a 10-minute cron later if Operator still wants it
