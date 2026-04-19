#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const registryPath = '/home/leo/.openclaw/workspace/missions/registry.json';
const stateRoot = '/home/leo/.openclaw/workspace/missions/state';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const now = new Date().toISOString();
const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
const ORCHESTRATOR_ID = 'frank-orchestrator';
const ORCHESTRATOR_RUNNER = 'stack-autonomous-resume';

function inferWorkerAssignment(mission, state = {}) {
  const text = [
    mission.mission_id,
    mission.title,
    mission.goal,
    mission.summary,
    mission.next_action,
    state.current_step,
    state.next_action,
    state.summary,
  ].filter(Boolean).join(' ').toLowerCase();

  const hasAny = (...terms) => terms.some(term => text.includes(term));

  if (hasAny('research', 'shortlist', 'compare', 'benchmark', 'references', 'rubric', 'choose the best', 'storytelling', '3d')) {
    return {
      preferred_agent_id: 'worker-research',
      lane: 'research',
      reason: 'Research/comparison keywords matched the mission brief.',
    };
  }

  if (hasAny('build', 'fix', 'dashboard', 'mcp', 'code', 'app structure', 'site/app', 'chromium', 'browser automation', 'live dashboard')) {
    return {
      preferred_agent_id: 'worker-dev',
      lane: 'dev',
      reason: 'Build/fix/coding keywords matched the mission brief.',
    };
  }

  return {
    preferred_agent_id: 'worker-ops',
    lane: 'ops',
    reason: 'Defaulted to operations flow for setup, reporting, dispatch, or mission coordination work.',
  };
}

function buildWorkerSessionId(missionId, preferredAgentId) {
  return `mission-${preferredAgentId}-${missionId}`.replace(/[^a-zA-Z0-9._:-]/g, '-').slice(0, 120);
}

function preferredMissionRank(m) {
  if (
    m.mission_id === 'slack-mission-organizer' &&
    m.status === 'running' &&
    m.priority === 'P0'
  ) {
    return 0;
  }
  return 1;
}

function hasBlockingMarker(m) {
  return Boolean((m.blocked_on || '').trim()) || m.status === 'waiting_input';
}

function resumable(m) {
  if (!['running', 'waiting_retry', 'new'].includes(m.status)) return false;
  if (m.status === 'waiting_retry' && m.retry_after) {
    return Date.parse(m.retry_after) <= Date.now();
  }
  if (hasBlockingMarker(m)) return false;
  return true;
}

const candidates = registry.missions.filter(resumable).sort((a, b) => {
  const ra = preferredMissionRank(a);
  const rb = preferredMissionRank(b);
  if (ra !== rb) return ra - rb;
  const pa = priorityOrder[a.priority] ?? 9;
  const pb = priorityOrder[b.priority] ?? 9;
  if (pa !== pb) return pa - pb;
  return Date.parse(a.last_update || 0) - Date.parse(b.last_update || 0);
});

if (candidates.length === 0) {
  console.log(JSON.stringify({ ok: true, resumed: false, reason: 'no resumable mission' }, null, 2));
  process.exit(0);
}

const mission = candidates[0];
const statePath = path.join(stateRoot, `${mission.mission_id}.json`);
if (!fs.existsSync(statePath)) {
  console.error(`Missing state file for ${mission.mission_id}`);
  process.exit(1);
}
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
state.resume_count = (state.resume_count || 0) + 1;
state.status = state.status === 'new' ? 'running' : state.status;
state.last_update = now;
state.updated_at = now;
state.owner_agent = state.owner_agent || ORCHESTRATOR_ID;
state.current_executor = {
  kind: 'orchestrator',
  agent_id: ORCHESTRATOR_ID,
  runner: ORCHESTRATOR_RUNNER,
  claimed_at: now,
  mission_id: state.mission_id,
};
state.subagents = Array.isArray(state.subagents) ? state.subagents : [];
const workerAssignment = inferWorkerAssignment(mission, state);
state.worker_plan = {
  preferred_agent_id: workerAssignment.preferred_agent_id,
  lane: workerAssignment.lane,
  session_id: buildWorkerSessionId(state.mission_id, workerAssignment.preferred_agent_id),
  assigned_at: now,
  reason: workerAssignment.reason,
};
state.last_progress_note = `Autonomous orchestrator claimed mission at ${now} and assigned ${workerAssignment.preferred_agent_id} (${workerAssignment.lane}).`;
mission.status = state.status;
mission.last_update = now;
mission.owner_agent = state.owner_agent;
mission.current_executor = state.current_executor;
mission.subagent_count = state.subagents.length;
mission.preferred_agent_id = state.worker_plan.preferred_agent_id;
mission.execution_lane = state.worker_plan.lane;
fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(JSON.stringify({
  ok: true,
  resumed: true,
  mission_id: state.mission_id,
  title: state.title,
  status: state.status,
  owner_agent: state.owner_agent,
  current_executor: state.current_executor,
  subagent_count: state.subagents.length,
  preferred_agent_id: state.worker_plan.preferred_agent_id,
  execution_lane: state.worker_plan.lane,
  worker_session_id: state.worker_plan.session_id,
  current_step: state.current_step,
  next_action: state.next_action,
  blocked_on: state.blocked_on,
  drive_root: state.drive_root,
  state_path: statePath,
  skipped_blocked: registry.missions
    .filter(m => ['running', 'waiting_retry', 'new', 'waiting_input'].includes(m.status))
    .filter(hasBlockingMarker)
    .map(m => ({ mission_id: m.mission_id, status: m.status, blocked_on: m.blocked_on || 'waiting_input' }))
}, null, 2));
