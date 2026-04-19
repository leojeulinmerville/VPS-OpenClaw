#!/usr/bin/env node
// pick-next-mission.js — Deterministic mission eligibility & selection
// Returns at most one mission eligible for dispatch, or null.
// Exit 0 always. Output is JSON to stdout.
//
// Eligibility rules:
//   1. Status must be running, waiting_retry (past retry_after), or new
//   2. Not blocked (no blocked_on, not waiting_input)
//   3. Not dispatched in the last COOLDOWN_MS (default 2h)
//   4. Has a state file with a non-empty next_action or current_step
//   5. current_step must not be a "wait for" stall pattern
//
// Selection: highest priority (P0>P1>…), then oldest last_dispatch_at

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/leo/.openclaw/workspace/missions';
const registryPath = path.join(WORKSPACE, 'registry.json');
const stateRoot = path.join(WORKSPACE, 'state');

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours between dispatches per mission
const STALL_PATTERNS = [
  /^wait\b/i,
  /^waiting\b/i,
  /^blocked\b/i,
  /^pending\b/i,
  /^no.?op/i,
];

const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
const now = Date.now();

function isStalled(text) {
  if (!text) return true;
  return STALL_PATTERNS.some(p => p.test(text.trim()));
}

function loadState(missionId) {
  const p = path.join(stateRoot, `${missionId}.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
} catch (e) {
  console.log(JSON.stringify({ mission: null, reason: 'cannot read registry', error: e.message }));
  process.exit(0);
}

const results = { candidates: [], skipped: [], selected: null };

for (const m of registry.missions) {
  if (!['running', 'waiting_retry', 'new'].includes(m.status)) {
    continue;
  }

  if ((m.blocked_on || '').trim() || m.status === 'waiting_input') {
    results.skipped.push({ id: m.mission_id, reason: 'blocked' });
    continue;
  }

  if (m.status === 'waiting_retry' && m.retry_after && Date.parse(m.retry_after) > now) {
    results.skipped.push({ id: m.mission_id, reason: 'retry_not_due' });
    continue;
  }

  const state = loadState(m.mission_id);
  if (!state) {
    results.skipped.push({ id: m.mission_id, reason: 'no_state_file' });
    continue;
  }

  const action = state.next_action || state.current_step || '';
  if (isStalled(action)) {
    results.skipped.push({ id: m.mission_id, reason: 'stalled_step', step: action.substring(0, 80) });
    continue;
  }

  const lastDispatch = state.last_dispatch_at ? Date.parse(state.last_dispatch_at) : 0;
  if (lastDispatch && (now - lastDispatch) < COOLDOWN_MS) {
    results.skipped.push({ id: m.mission_id, reason: 'cooldown', minutes_remaining: Math.ceil((COOLDOWN_MS - (now - lastDispatch)) / 60000) });
    continue;
  }

  results.candidates.push({
    mission_id: m.mission_id,
    priority: m.priority,
    status: m.status,
    next_action: action.substring(0, 120),
    last_dispatch_at: state.last_dispatch_at || null,
  });
}

results.candidates.sort((a, b) => {
  const pa = priorityOrder[a.priority] ?? 9;
  const pb = priorityOrder[b.priority] ?? 9;
  if (pa !== pb) return pa - pb;
  const da = a.last_dispatch_at ? Date.parse(a.last_dispatch_at) : 0;
  const db = b.last_dispatch_at ? Date.parse(b.last_dispatch_at) : 0;
  return da - db;
});

if (results.candidates.length > 0) {
  results.selected = results.candidates[0];
}

console.log(JSON.stringify({
  mission: results.selected,
  candidate_count: results.candidates.length,
  skipped: results.skipped,
  reason: results.selected ? 'eligible' : 'no_eligible_mission',
}, null, 2));
