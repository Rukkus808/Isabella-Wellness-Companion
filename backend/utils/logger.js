// LOGGER UTILITY
// Isabella Community Edition — Open Source
// Vaultagon Industries
// No console.log in production — use this instead

'use strict';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const IS_PROD = process.env.NODE_ENV === 'production';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[LOG_LEVEL] ?? 2;

function log(level, message, meta = {}) {
  if (levels[level] > currentLevel) return;
  const entry = { timestamp: new Date().toISOString(), level, message, ...meta };
  process.stdout.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta)
};
