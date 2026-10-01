#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input-dir');
const outputIndex = args.indexOf('--output');

if (inputIndex < 0 || outputIndex < 0 || !args[inputIndex + 1] || !args[outputIndex + 1]) {
  console.error('Usage: node replay_engine.js --input-dir <directory> --output <file>');
  process.exitCode = 2;
} else {
  console.error('The replay prototype is incomplete.');
  process.exitCode = 1;
}
