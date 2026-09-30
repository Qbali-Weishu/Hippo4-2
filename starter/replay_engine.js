#!/usr/bin/env node
'use strict';

const {parseArguments} = require('./lib/cli');
const {loadBundle} = require('./lib/input');
const {replay} = require('./lib/replay');
const {writeDeliverables} = require('./lib/output');

try {
  const args = parseArguments(process.argv);
  const bundle = loadBundle(args.inputDir);
  writeDeliverables(args.outputFile, replay(bundle));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
