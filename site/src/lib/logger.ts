import kleur from "kleur";

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  label?: string;
  startTime?: number;
}

const colors = {
  info: kleur.blue,
  warn: kleur.yellow,
  error: kleur.red,
};

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getEventPrefix({ level = "info", label }: LogOptions) {
  const timestamp = `${dateTimeFormat.format(new Date())}`;
  const color = colors[level];
  const prefix = [];
  prefix.push(kleur.dim(timestamp));
  if (level === "error" || level === "warn") {
    prefix.push(color(`[${level.toUpperCase()}]`));
  }
  if (label) {
    prefix.push(color(`[${label}]`));
  }
  return prefix.join(" ");
}

function getEventSuffix({ startTime }: LogOptions = {}) {
  if (!startTime) return;
  return kleur.dim(`${Math.round(performance.now() - startTime)}ms`);
}

export function createLogger(label?: string, disableInProduction = false) {
  const parseParams = (
    options: LogOptions,
    message?: any,
    ...optionalParams: any[]
  ) => {
    const prefix = getEventPrefix(options);
    const suffix = getEventSuffix(options);
    return [[prefix, message].join(" "), ...optionalParams, suffix].filter(
      (param) => param !== undefined,
    );
  };
  const getLogFn = ({ level = "info", ...options }: LogOptions) => {
    const fnMap = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
    return (...params: any[]) => {
      if (disableInProduction && import.meta.env.PROD) return;
      if (!params.length) return;
      fnMap[level](...parseParams({ level, ...options }, ...params));
    };
  };
  const getLogFns = (options: LogOptions) => {
    return {
      info: getLogFn({ level: "info", ...options }),
      warn: getLogFn({ level: "warn", ...options }),
      error: getLogFn({ level: "error", ...options }),
    };
  };
  return {
    ...getLogFns({ label }),
    start: () => {
      return getLogFns({ label, startTime: performance.now() });
    },
    since: (startTime?: number) => {
      return getLogFns({ label, startTime });
    },
  };
}

export const createDevLogger = (label?: string) => createLogger(label, true);
export const logger = createLogger("app");
export const devLogger = createDevLogger("app");
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;
