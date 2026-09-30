'use strict';

function parseArguments(argv) {
  const value = name => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : '';
  };
  const inputDir = value('--input-dir');
  const outputFile = value('--output');
  if (!inputDir || !outputFile) throw new Error('Usage: replay_engine.js --input-dir DIR --output FILE');
  return {inputDir, outputFile};
}

module.exports = {parseArguments};
