# OpenClaw Workspace Control Plane

This repository is a sanitized export of the durable workspace layer used around OpenClaw on a VPS.

It is **not** the official OpenClaw source repository.
Official upstream: [openclaw/openclaw](https://github.com/openclaw/openclaw)

## What this repo contains

- Workspace bootstrap and agent behavior docs
- Mission-control documentation and orchestration scripts
- Durable stack notes and task template files
- A shareable snapshot that can be pushed to GitHub without dragging along live runtime noise

## What was intentionally excluded

- Personal memory and user-specific notes
- Live mission state, logs, queue/outbox data, and transient incident records
- Local `.openclaw` runtime files
- Temporary assets, extracted images, virtual environments, and side projects
- Nested repositories and machine-specific clutter

## Useful entry points

- `missions/README.md`
- `missions/scripts/`
- `stack/README.md`
- `stack/tasks/TEMPLATE.md`
- `AGENTS.md`

## Quick start

```bash
node missions/scripts/create-mission.js <mission_id> <channel> <thread_ts> <title> <goal> [priority]
node missions/scripts/set-mission.js <mission_id> <field> <value>
node missions/scripts/run-mission-step.js
```

## Publish to GitHub

Once a target repository exists, from this folder:

```bash
git branch -M main
git remote add origin git@github.com:<your-user>/<your-repo>.git
git push -u origin main
```

If SSH push fails, add the VPS public key to GitHub first or switch to HTTPS auth.
