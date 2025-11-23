type LogLevels = {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
};

type LogLevelValues = LogLevels[keyof LogLevels];

const LogLevels: LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

let currentLogLevel: LogLevelValues =
  process.env.NODE_ENV === "production" ? LogLevels.ERROR : LogLevels.DEBUG;

export class Logger {
  public static setLevel(level: LogLevelValues) {
    currentLogLevel = level;
  }

  public static debug(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevels.DEBUG) {
      console.trace(`[DEBUG] ${message}`, ...args);
    }
  }
  public static info(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevels.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  public static warn(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevels.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  public static error(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevels.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}
