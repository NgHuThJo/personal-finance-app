type LogLevel = "debug" | "info" | "warning" | "error";

class Logger {
  #levels: { [key in LogLevel]: number } = {
    debug: 0,
    info: 1,
    warning: 2,
    error: 3,
  };

  #currentLevel: number = this.#levels.debug;

  #log(level: LogLevel, ...args: any[]) {
    if (this.#levels[level] >= this.#currentLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}]:`, ...args);
    }
  }

  setLevel(level: LogLevel) {
    if (this.#levels[level] !== undefined) {
      this.#currentLevel = this.#levels[level];
    } else {
      console.error(`Logger: Invalid level '${level}'`);
    }
  }

  debug(...args: any[]) {
    this.#log("debug", ...args);
  }

  info(...args: any[]) {
    this.#log("info", ...args);
  }

  warning(...args: any[]) {
    this.#log("warning", ...args);
  }

  error(...args: any[]) {
    this.#log("error", ...args);
  }
}

export default new Logger();
