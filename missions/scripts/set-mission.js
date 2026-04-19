#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [,, missionId, ...pairs] = process.argv;
if (!missionId || pairs.length === 0 || pairs.length % 2 !== 0) {
  console.error('Usage: set-mission.js <mission_id> <field> <value> [<field> <value> ...]');
  process.exit(1);
}

const root = '/home/leo/.openclaw/workspace/missions';
const registryPath = path.join(root, 'registry.json');
const statePath = path.join(root, 'state', `${missionId}.json`);
if (!fs.existsSync(statePath)) {
  console.error(`Mission state not found: ${missionId}`);
  process.exit(1);
}

const now = new Date().toISOString();
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const entry = registry.missions.find(m => m.mission_id === missionId);
if (!entry) {
  console.error(`Mission registry entry not found: ${missionId}`);
  process.exit(1);
}

for (let i = 0; i < pairs.length; i += 2) {
  const field = pairs[i];
  let value = pairs[i + 1];
  if (value === '__EMPTY__') value = '';
  if (value === 'true') value = true;
  else if (value === 'false') value = false;
  state[field] = value;
  if (['title','goal','status','priority','blocked_on','retry_after','last_update','channel','thread_ts'].includes(field)) {
    entry[field] = value;
  }
  if (field === 'summary') {
    entry.summary = value;
  }
  if (field === 'next_action') {
    entry.next_action = value;
  }
}

state.updated_at = now;
state.last_update = now;
entry.last_update = now;
fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(JSON.stringify({ mission_id: missionId, updated_at: now }, null, 2));
