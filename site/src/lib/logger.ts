/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { AstroIntegrationLogger } from "astro";
import kleur from "kleur";

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  label?: string;
  timestamp?: boolean;
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

function getEventPrefix({
  level = "info",
  timestamp = true,
  label,
}: LogOptions) {
  const color = colors[level];
  const prefix = [];
  if (timestamp) {
    prefix.push(kleur.dim(dateTimeFormat.format(new Date())));
  }
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

export function createLogger(
  labelOrLogger?: string | AstroIntegrationLogger,
  disableInProduction = false,
) {
  const label = typeof labelOrLogger === "string" ? labelOrLogger : undefined;
  const logger = typeof labelOrLogger === "object" ? labelOrLogger : undefined;
  const parseParams = (
    options: LogOptions,
    message?: any,
    ...optionalParams: any[]
  ) => {
    const prefix = getEventPrefix(options);
    const suffix = getEventSuffix(options);
    const text =
      typeof message === "string" ? message : JSON.stringify(message, null, 2);
    const firstParam = prefix ? [prefix, text].join(" ") : text;
    return [firstParam, ...optionalParams, suffix]
      .filter((param) => param !== undefined)
      .join(" ");
  };
  const getLogFn = ({
    level = "info",
    timestamp = !logger,
    ...options
  }: LogOptions) => {
    const fnMap = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
    return (...params: any[]) => {
      if (disableInProduction && import.meta.env.PROD) return;
      if (!params.length) return;
      const log = logger?.[level].bind(logger) || fnMap[level];
      log(parseParams({ level, timestamp, ...options }, ...params));
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
