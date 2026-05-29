#!/usr/bin/env node

import { program } from "commander";
import { build, clean } from "./build.ts";
import { dev } from "./dev.ts";
import { react18 } from "./react18.ts";

program.name("ariakit");

program
  .command("build")
  .description("Build packages")
  .option("--index-only", "Build and export only src/index.ts")
  .action(build);

program
  .command("clean")
  .description("Clean package build output")
  // lint-staged appends matched filenames to package scripts.
  .argument("[files...]", "Ignored file arguments passed by lint-staged")
  .option("--index-only", "Export only src/index.ts")
  .action((_files, options) => clean(options));

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
  .description("Run a command in an isolated React 18 workspace")
  .argument("[command...]", "Root script or command to run")
  .allowUnknownOption()
  .helpOption(false)
  .action(react18);

program
  .command("perf-compare")
  .description("Compare performance results")
  .option("--node", "Compare Vitest benchmark results")
  .action(async (options) => {
    const { runPerfCompare } = await import("./perf-compare.ts");
    const { markdown } = runPerfCompare({ node: options.node });
    console.log(markdown);
  });

try {
  await program.parseAsync();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
