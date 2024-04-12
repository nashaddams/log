// Copyright 2024 the @nashaddams/log author. All rights reserved. MIT license.

/**
 * A very basic logging utility with no dependencies.
 *
 * **Console logging**
 * ```ts
 * import { Log } from "@nashaddams/log";
 *
 * const log = Log.init();
 *
 * log.debug(...); // No output with default log level `warn`
 * log.info(...);  // No output with default log level `warn`
 * log.warn(...);  // 2024-03-01T12:34:56.789Z WARN ...
 * log.error(...); // 2024-03-01T12:34:56.789Z ERROR ...
 * ```
 *
 * **File logging**
 * ```ts
 * import { Log } from "@nashaddams/log";
 *
 * const log = Log.init({
 *   level: "debug",
 *   target: ["file"],
 *   prefix: "[consumer]",
 *   filePath: "consumer.log",
 * });
 *
 * log.debug(...); // 2024-03-01T12:34:56.789Z DEBUG [consumer] ...
 * log.info(...);  // 2024-03-01T12:34:56.789Z INFO [consumer] ...
 * log.warn(...);  // 2024-03-01T12:34:56.789Z WARN [consumer] ...
 * log.error(...); // 2024-03-01T12:34:56.789Z ERROR [consumer] ...
 * ```
 *
 * @module
 */

// deno-lint-ignore-file no-explicit-any

const LEVEL = ["debug", "info", "warn", "error"];

/** Configuration for `Log.init` */
export interface Config {
  /** Minimum log level (default: `warn`) */
  level: "debug" | "info" | "warn" | "error";
  /** Log target (default: `console`) */
  target: Array<"console" | "file">;
  /** Log file path (default: `.log`) */
  filePath: string;
  /** Optional log prefix */
  prefix: string;
}

/** Logging class */
export class Log {
  static #instance: Log;
  #config: Config;

  /** @ignore */
  private constructor(config?: Partial<Config>) {
    this.#config = {
      level: "warn",
      target: ["console"],
      filePath: ".log",
      prefix: "",
      ...config,
    };
  }

  #write(level: Config["level"], ...data: any[]) {
    const { level: configLevel, prefix, target, filePath } = this.#config;

    if (LEVEL.indexOf(level) < LEVEL.indexOf(configLevel)) {
      return;
    }

    if (target.includes("console")) {
      console[level](
        `${new Date().toISOString()} ${level.toUpperCase()}${
          prefix ? ` ${prefix}` : ""
        }`,
        ...data,
      );
    }

    if (target.includes("file")) {
      // Check if in browser
      // @ts-expect-error 2580
      if (typeof document === "object") {
        console.warn("Unable to log to file in a browser environment.");
        return;
      }

      const sanitized = data.map((d) => {
        if (d instanceof Error) return d.stack ? d.stack : d.toString();
        if (typeof d === "object") return JSON.stringify(d);
        if (d === undefined) return "undefined";
        return d.toString();
      });

      const logString = `${new Date().toISOString()} ${level.toUpperCase()}${
        prefix ? ` ${prefix}` : ""
      } ${sanitized.join(" ")}\n`;

      // Deno
      if (typeof Deno === "object") {
        Deno.writeTextFileSync(filePath, logString, {
          append: true,
        });
      }

      // Node & Bun
      // deno-lint-ignore no-process-globals
      if (typeof process === "object") {
        import("node:fs").then((fs) => {
          fs.writeFileSync(filePath, logString, { flag: "a+" });
        });
      }
    }
  }

  /** Static initializer */
  static init(config?: Partial<Config>): Log {
    if (this.#instance) return this.#instance;
    this.#instance = new Log(config);
    return this.#instance;
  }

  /** Print a `DEBUG` log */
  debug = (...data: any[]): void => this.#write("debug", ...data);
  /** Print an `INFO` log */
  info = (...data: any[]): void => this.#write("info", ...data);
  /** Print a `WARN` log */
  warn = (...data: any[]): void => this.#write("warn", ...data);
  /** Print an `ERROR` log */
  error = (...data: any[]): void => this.#write("error", ...data);
}
