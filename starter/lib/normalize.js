'use strict';

function time(value, kind, drift = 0) {
  if (kind === 'sql') return new Date(Number(value));
  if (kind === 'cdn') return new Date(value);
  return new Date(value);
}

function inside(value, start, end) {
  return value >= start && value <= end;
}

function iso(value) { return new Date(value).toISOString(); }

module.exports = {time, inside, iso};
