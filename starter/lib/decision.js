'use strict';

function stateAt(feeds, sourceRef, time) {
  const rows = feeds.filter(row => row.source_ref === sourceRef && new Date(row.valid_from) <= time);
  return rows.length ? rows[rows.length - 1].status : 'unknown';
}

function decide(candidate, replay, bundle) {
  const seed = bundle.web.find(row => row.id === candidate.seed_web_id);
  const app = bundle.governance.application_inventory.find(row => row.app === seed?.app);
  const classification = replay.valid && replay.chain.length === 4 ? 'confirmed' : replay.valid ? 'unresolved' : 'invalid';
  return {
    id: candidate.candidate_id,
    valid: replay.valid,
    classification,
    action: classification === 'confirmed' ? (app?.change_freeze === 'true' ? 'scoped-block' : 'contain') : 'hold-investigate',
    canonical_user: replay.canonicalUser,
    event_time_utc: seed ? seed.time : candidate.window_start_utc,
    intel_at_event: stateAt(bundle.feeds, seed?.source_ref, seed ? new Date(seed.time) : new Date(candidate.window_start_utc)),
    intel_at_anchor: stateAt(bundle.feeds, seed?.source_ref, bundle.anchor),
    coverage: 'complete',
    chain: replay.chain,
    evidence_ids: [...new Set(replay.evidenceIds)],
  };
}

module.exports = {decide};
