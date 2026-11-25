#!/usr/bin/env node

import { InvalidArgumentError, program } from "commander";
import { build, clean } from "./build.ts";
import { dev } from "./dev.ts";
import { react18 } from "./react18.ts";

program.name("ariakit");

function parseCount(value: string, min: number) {
  const count = Number(value);
  if (Number.isInteger(count) && count >= min) return count;
  throw new InvalidArgumentError(`Use a whole number from ${min}.`);
}

program
  .command("build")
  .description("Build packages")
  .option("--index-only", "Build and export only src/index.ts")
  .option(
    "--entries <names>",
    "Comma-separated entry file names to build and export",
    (value) => value.split(","),
  )
  .action(build);

program
  .command("clean")
  .description("Clean package build output")
  .option("--index-only", "Export only src/index.ts")
  .option(
    "--entries <names>",
    "Comma-separated entry file names to export",
    (value) => value.split(","),
  )
  .action(clean);

program
  .command("dev")
  .description("Start dev servers with automatic port detection")
  .option("--clean", "Clean and watch package builds", true)
  .option("--no-clean", "Use current package exports without cleaning")
  .action(dev);

program
  .command("docs")
  .description("Generate API markdown from TypeScript JSDoc")
  .option("--entry <path>", "Entry file path", "src/index.ts")
  .option("--tsconfig <path>", "TypeScript config path")
  .option("--readme <path>", "Readme path used with --write", "readme.md")
  .option("--marker <name>", "Marker block name used with --write")
  .option("--heading <text>", "API reference heading")
  .option(
    "--exclude <path...>",
    "Omit exports re-exported from these files or packages",
  )
  .option("--write", "Inject generated markdown into the readme")
  .action(async (options) => {
    const { docs } = await import("./docs.ts");
    docs(options);
  });

program
  .command("react18")
  .description(
    "Run `ariakit react18 -- <command>` in an isolated React 18 workspace",
  )
  .usage("-- <command> [args...]")
  .argument("[command...]", "Command and arguments following `--`")
  .allowUnknownOption()
  .helpOption(false)
  .action(react18);

program
  .command("perf-compare")
  .description("Compare performance results")
  .option("--node", "Compare Vitest benchmark results")
  .option(
    "--results-dir <path>",
    "Directory holding the result files; relative paths resolve against the current directory (default: .perf-results)",
  )
  .action(async (options) => {
    const { runPerfCompare } = await import("./perf-compare.ts");
    const { markdown } = runPerfCompare({
      node: options.node,
      resultsDir: options.resultsDir,
    });
    console.log(markdown);
  });

program
  .command("style-compare")
  .description(
    "Compare the computed styles of every element between two app builds",
  )
  .argument(
    "[pages...]",
    "Page path prefixes to compare, such as react/previews/app-shell (default: all pages)",
  )
  .requiredOption(
    "--baseline <path>",
    "Baseline build folder, such as a saved copy of app/dist/client",
  )
  .requiredOption("--current <path>", "Current build folder")
  .option(
    "--browsers <names>",
    "Comma-separated browsers: chromium, webkit (default: all)",
  )
  .option(
    "--motions <values>",
    "Comma-separated prefers-reduced-motion values: reduce, no-preference (default: all)",
  )
  .option(
    "--states <names>",
    "Comma-separated states: rest, narrow, hover, focus, selected, disabled, dark, forced, rtl (default: all)",
  )
  .option(
    "--workers <count>",
    "Pages that load at the same time in each build (default: 3/4 of the CPUs)",
    (value) => parseCount(value, 1),
  )
  .option(
    "--details <count>",
    "Elements to detail for each different page state (default: 12)",
    (value) => parseCount(value, 0),
  )
  .option(
    "--ignore-properties <names>",
    "Comma-separated computed properties to skip; a trailing * matches a prefix, such as --tw-*",
  )
  .action(async (pages: string[], options) => {
    const {
      hasStyleCompareFailures,
      parseStyleCompareList,
      runStyleCompare,
      splitStyleCompareList,
      styleCompareBrowsers,
      styleCompareMotions,
      styleCompareStates,
    } = await import("./style-compare.ts");
    const parse = <T extends string>(
      value: string | undefined,
      allowed: readonly T[],
    ) => {
      if (value == null) return;
      try {
        return parseStyleCompareList(value, allowed);
      } catch (error) {
        const message = error instanceof Error ? error.message : error;
        return program.error(`error: ${String(message)}`);
      }
    };
    const report = await runStyleCompare({
      baseline: options.baseline,
      current: options.current,
      pages,
      browsers: parse(options.browsers, styleCompareBrowsers),
      motions: parse(options.motions, styleCompareMotions),
      states: parse(options.states, styleCompareStates),
      workers: options.workers,
      details: options.details,
      ignoreProperties:
        options.ignoreProperties == null
          ? undefined
          : splitStyleCompareList(options.ignoreProperties),
    });
    if (hasStyleCompareFailures(report)) {
      process.exitCode = 1;
    }
  });

program
  .command("perf-check-node-results")
  .description("Check focused Vitest benchmark results")
  .argument("<file>", "Vitest benchmark JSON file")
  .argument("<expected-count>", "Expected benchmark count", (value) =>
    Number(value),
  )
  .action(async (file, expectedCount) => {
    const { checkNodeBenchmarkResults } = await import("./perf-compare.ts");
    checkNodeBenchmarkResults(file, expectedCount);
  });

await program.parseAsync();
