'use strict';

const {correlate} = require('./correlate');
const {chainFor} = require('./chain');
const {decide} = require('./decision');
const {plan} = require('./query');

function replay(bundle) {
  const correlation = correlate(bundle);
  const candidates = bundle.windows.map(candidate => decide(candidate, chainFor(candidate, correlation), bundle));
  const summary = candidates.reduce((result, row) => { result[row.classification] = (result[row.classification] || 0) + 1; return result; }, {});
  return {schema_version: 1, as_of_utc: bundle.anchor.toISOString(), candidates, summary, query_plan: plan(bundle)};
}

module.exports = {replay};
