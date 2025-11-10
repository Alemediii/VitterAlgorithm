const util = require('util');

// Levels
const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40, NONE: 50 };
let currentLevel = LEVELS.DEBUG;

// Color codes (ANSI)
const COLORS = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  cyan: '\u001b[36m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  red: '\u001b[31m'
};

// Auto-detect whether to use colors (TTY) and allow override
let useColors = (process && process.stdout && process.stdout.isTTY) ? true : false;

function enableColors(v) {
  if (typeof v === 'boolean') useColors = v;
  return useColors;
}

function levelNameToValue(name) {
  if (typeof name === 'number') return name;
  if (!name) return undefined;
  const up = String(name).toUpperCase();
  return LEVELS[up] || undefined;
}

function setLevel(nameOrValue) {
  const val = levelNameToValue(nameOrValue);
  if (typeof val === 'number') currentLevel = val;
  else throw new Error('Unknown log level: ' + String(nameOrValue));
}

function getLevel() {
  return currentLevel;
}

function timestamp() {
  return new Date().toISOString();
}

function colorize(text, colorCode) {
  if (!useColors || !colorCode) return text;
  return colorCode + text + COLORS.reset;
}

function formatPrefix(levelName) {
  const time = colorize(timestamp(), COLORS.dim);
  const lvl = levelName.toUpperCase();
  let coloredLvl = lvl;
  if (useColors) {
    if (lvl === 'DEBUG') coloredLvl = colorize(lvl, COLORS.cyan);
    else if (lvl === 'INFO') coloredLvl = colorize(lvl, COLORS.green);
    else if (lvl === 'WARN') coloredLvl = colorize(lvl, COLORS.yellow);
    else if (lvl === 'ERROR') coloredLvl = colorize(lvl, COLORS.red);
  }
  return `[${time}] [${coloredLvl}]`;
}

function shouldLog(levelValue) {
  return levelValue >= currentLevel;
}

function logAt(levelName, levelValue, args) {
  if (!shouldLog(levelValue)) return;
  const prefix = formatPrefix(levelName);
  const msg = util.format.apply(null, args);
  // ensure newline
  const output = `${prefix} ${msg}`;
  if (levelValue >= LEVELS.ERROR) {
    console.error(output);
  } else {
    console.log(output);
  }
}

const logger = {
  debug: function() { logAt('DEBUG', LEVELS.DEBUG, arguments); },
  info: function() { logAt('INFO', LEVELS.INFO, arguments); },
  warn: function() { logAt('WARN', LEVELS.WARN, arguments); },
  error: function() { logAt('ERROR', LEVELS.ERROR, arguments); },
  setLevel: setLevel,
  getLevel: getLevel,
  enableColors: enableColors,
  LEVELS: LEVELS
};

module.exports = logger;
