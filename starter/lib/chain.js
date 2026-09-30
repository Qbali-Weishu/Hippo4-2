'use strict';

const {inside, iso} = require('./normalize');

function chainFor(candidate, correlation) {
  const start = new Date(candidate.window_start_utc);
  const end = new Date(candidate.window_end_utc);
  const events = correlation.web.filter(row => inside(row.utc, start, end));
  const seed = events.find(row => row.id === candidate.seed_web_id);
  if (!seed) return {valid: false, canonicalUser: '', chain: [], evidenceIds: []};
  const rows = [{stage: 'recon', id: seed.id, time: iso(seed.utc), web_id: seed.id, request_id: seed.request_id}];
  const auth = events.flatMap(row => row.auth).find(row => row.outcome === 'success');
  if (auth) rows.push({stage: 'auth', id: auth.id, time: iso(auth.utc), auth_id: auth.id, request_id: auth.request_id});
  const exploit = events.find(row => row.effect === 'stored' || row.sql.some(sql => sql.effect === 'executed'));
  if (exploit) rows.push({stage: 'exploit', id: exploit.id, time: iso(exploit.utc), web_id: exploit.id, request_id: exploit.request_id});
  const data = events.find(row => row.effect === 'exported' || row.sql.some(sql => sql.sensitive_rows > 0));
  if (data) rows.push({stage: 'data', id: data.id, time: iso(data.utc), web_id: data.id, request_id: data.request_id});
  return {valid: true, canonicalUser: seed.user.canonicalUser, chain: rows, evidenceIds: rows.flatMap(row => [row.id, row.request_id]).filter(Boolean)};
}

module.exports = {chainFor};
