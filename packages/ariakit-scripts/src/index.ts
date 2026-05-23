#!/usr/bin/env node

import { program } from "commander";
import { build, clean } from "./build.ts";
import { dev } from "./dev.ts";

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

program.parse();
