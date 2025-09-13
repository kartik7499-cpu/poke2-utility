const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const catchLogPath = path.join(logsDir, "catches.txt");
const statsPath = path.join(logsDir, "stats.json");

// Generic logger
function log(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${msg}`;

  switch (level) {
    case "success":
      console.log(chalk.green(line));
      break;
    case "error":
      console.log(chalk.red(line));
      break;
    case "warn":
      console.log(chalk.yellow(line));
      break;
    case "info":
    default:
      console.log(chalk.blue(line));
      break;
  }
}

// Append catch log
function logCatch(data) {
  const line = `[${new Date().toISOString()}] ${data}\n`;
  fs.appendFileSync(catchLogPath, line, "utf8");
}

// Update stats.json (aggregate stats)
function updateStats(pokemon, rarity, iv, level) {
  let stats = {};
  if (fs.existsSync(statsPath)) {
    stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
  }

  if (!stats[pokemon]) {
    stats[pokemon] = { count: 0, rarity, avgIV: 0, avgLevel: 0 };
  }

  const entry = stats[pokemon];
  entry.count += 1;
  entry.avgIV = ((entry.avgIV * (entry.count - 1)) + iv) / entry.count;
  entry.avgLevel = ((entry.avgLevel * (entry.count - 1)) + level) / entry.count;

  stats[pokemon] = entry;
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

module.exports = {
  log,
  logCatch,
  updateStats,
  success: (msg) => log("success", msg),
  error: (msg) => log("error", msg),
  info: (msg) => log("info", msg),
  warn: (msg) => log("warn", msg),
};
