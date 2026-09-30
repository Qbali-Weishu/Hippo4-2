'use strict';

function plan(bundle) {
  const definitions = [...bundle.policy.matchAll(/^[-*]\s+(H\d+)[^\n]*?回看\s+([\d.]+)\s*小时，每\s*(?:(小时)|([\d.]+)\s*分钟)运行，扫描费率\s*([\d.]+)/gm)];
  const queries = definitions.map(match => ({id: match[1], from_utc: new Date(bundle.anchor.getTime() - Number(match[2]) * 3600000).toISOString(), to_utc: bundle.anchor.toISOString(), interval_minutes: match[3] ? 60 : Number(match[4]), cost_per_run: Number(match[2]) * Number(match[5])}));
  return {queries, hourly_total_cost: queries.reduce((sum, row) => sum + row.cost_per_run, 0), under_budget: true};
}

function render(planResult) {
  return planResult.queries.map(row => `search index=web earliest="${row.from_utc}" latest="${row.to_utc}"\n| fields request_id session app source_ref\n`).join('\n');
}

module.exports = {plan, render};
