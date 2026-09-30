'use strict';

function resolve(event, identity) {
  const alias = identity.user_aliases.find(row => row.app === event.app && row.local_user === event.local_user);
  return {canonicalUser: event.canonical_user || alias?.canonical_user || '', mismatch: false};
}

function binding(event, identity) {
  return identity.session_bindings.find(row => row.app === event.app && row.session === event.session) || null;
}

module.exports = {resolve, binding};
