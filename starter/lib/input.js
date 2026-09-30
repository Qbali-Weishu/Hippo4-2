'use strict';

const fs = require('node:fs');
const path = require('node:path');

function text(root, relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) throw new Error(`Missing input: ${relative}`);
  const value = fs.readFileSync(file, 'utf8');
  if (!value.trim()) throw new Error(`Empty input: ${relative}`);
  return value;
}

function json(root, relative) {
  try { return JSON.parse(text(root, relative)); }
  catch (error) { throw new Error(`Invalid JSON ${relative}: ${error.message}`); }
}

function jsonl(root, relative) {
  return text(root, relative).split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSONL ${relative}:${index + 1}`); }
  });
}

function csv(root, relative) {
  const rows = text(root, relative).trim().split(/\r?\n/).map(line => line.split(','));
  const headers = rows.shift();
  return rows.map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])));
}

function loadBundle(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`Missing input directory: ${root}`);
  const policy = text(root, 'policies/policies.md');
  const anchor = new Date(policy.match(/as_of_utc`:\s*`([^`]+)/)[1]);
  const drift = Number(policy.match(/edge_clock_ahead_seconds=(\d+)/)[1]);
  const web = jsonl(root, 'webapp_access/events.jsonl');
  const auth = jsonl(root, 'api_auth/events.jsonl');
  const sql = jsonl(root, 'app_sql_query/events.jsonl');
  const cdn = jsonl(root, 'cdn_logs/events.jsonl');
  const identity = json(root, 'identity/identity.json');
  const governance = json(root, 'governance/governance.json');
  const windows = json(root, 'attack_sessions/windows.json');
  const feeds = json(root, 'threat_intel_feeds/events.json');
  return {root, policy, anchor, drift, web, auth, sql, cdn, identity, governance, windows: windows.records, feeds: feeds.indicators, catalog: csv(root, 'source_catalog/catalog.csv')};
}

module.exports = {loadBundle};
