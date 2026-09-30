'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {render} = require('./query');

function report(result) {
  const lines = ['# Web attack-chain replay', '', `Analysis anchor: ${result.as_of_utc}`, '', '| Candidate | Classification | Action | User | Chain |', '|---|---|---|---|---:|'];
  for (const item of result.candidates) lines.push(`| ${item.id} | ${item.classification} | ${item.action} | ${item.canonical_user || 'none'} | ${item.chain.length} |`);
  return `${lines.join('\n')}\n`;
}

function writeDeliverables(outputFile, result) {
  const outputDir = path.dirname(outputFile);
  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'hunt_queries.spl'), render(result.query_plan));
  fs.writeFileSync(path.join(outputDir, 'hunt_report.md'), report(result));
}

module.exports = {writeDeliverables};
