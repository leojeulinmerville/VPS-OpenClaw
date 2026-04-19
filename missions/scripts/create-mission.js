#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [,, missionId, channel, threadTs, title, goal, priority='P2'] = process.argv;
if (!missionId || !channel || !threadTs || !title || !goal) {
  console.error('Usage: create-mission.js <mission_id> <channel> <thread_ts> <title> <goal> [priority]');
  process.exit(1);
}

const root = '/home/leo/.openclaw/workspace/missions';
const stateDir = path.join(root, 'state');
const registryPath = path.join(root, 'registry.json');
const statePath = path.join(stateDir, `${missionId}.json`);
const now = new Date().toISOString();
const driveRoot = `gdrive:Agent Missions/missions/${missionId}`;

fs.mkdirSync(stateDir, { recursive: true });
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (registry.missions.find(m => m.mission_id === missionId)) {
  console.error(`Mission already exists: ${missionId}`);
  process.exit(1);
}

const state = {
  mission_id: missionId,
  channel,
  thread_ts: threadTs,
  title,
  goal,
  status: 'new',
  priority,
  summary: '',
  current_step: 'Mission created',
  next_action: 'Clarify first bounded execution step',
  blocked_on: '',
  retry_after: '',
  external_artifacts: [],
  external_doc_urls: [],
  drive_root: driveRoot,
  created_at: now,
  updated_at: now,
  last_update: now,
  last_progress_note: 'Mission created',
  resume_count: 0
};

registry.missions.push({
  mission_id: missionId,
  channel,
  thread_ts: threadTs,
  title,
  goal,
  status: 'new',
  priority,
  drive_root: driveRoot,
  last_update: now,
  last_slack_update_at: '',
  blocked_on: '',
  retry_after: ''
});

fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(JSON.stringify({ mission_id: missionId, state_path: statePath, drive_root: driveRoot }, null, 2));
