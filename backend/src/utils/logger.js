const pino = require("pino");
const fs = require("fs");
const path = require("path");

const logDirectory = path.join(process.cwd(), "logs");

// logs klasörü yoksa oluştur
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// DD_MM_YYYY formatı
function getLogFileName() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${day}_${month}_${year}_log.log`;
}

function getLogFilePath() {
  return path.join(logDirectory, getLogFileName());
}

const fileStream = pino.destination({
  dest: getLogFilePath(),
  mkdir: true,
  sync: false
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",

    timestamp: pino.stdTimeFunctions.isoTime
  },
  fileStream
);

module.exports = logger;