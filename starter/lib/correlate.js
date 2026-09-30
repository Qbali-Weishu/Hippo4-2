'use strict';

const {time} = require('./normalize');
const {resolve} = require('./identity');

function correlate(bundle) {
  const web = bundle.web.map(event => ({
    ...event,
    utc: time(event.time, 'web'),
    user: resolve(event, bundle.identity),
    auth: bundle.auth.filter(row => row.session === event.session).map(row => ({...row, utc: time(row.time, 'auth'), user: resolve(row, bundle.identity)})),
    sql: bundle.sql.filter(row => row.request_id === event.request_id).map(row => ({...row, utc: time(row.time_ms, 'sql')})),
    cdn: bundle.cdn.filter(row => row.request_id === event.request_id),
  }));
  return {web};
}

module.exports = {correlate};
