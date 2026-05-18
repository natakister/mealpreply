// Jest manual mock for expo/virtual/env.
// The real module captures `process.env` at import time, so test reassignments
// of `process.env = { ... }` don't propagate. This proxy always reads through
// to whatever `process.env` currently points to.
const env = new Proxy(
  {},
  {
    get(_target, prop) {
      return process.env[prop];
    },
    has(_target, prop) {
      return prop in process.env;
    },
  }
);

module.exports = { env };
