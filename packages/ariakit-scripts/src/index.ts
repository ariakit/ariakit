#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build.ts";
import { dev } from "./dev.ts";

program.name("ariakit");

program
  .command("build")
  .description("Build packages")
  .argument("[files...]", "Ignored staged files")
  .option("--clean", "Remove build output")
  .option("--index-only", "Build and export only src/index.ts")
  .option("--update-exports", "Update package exports from public source files")
  .action((_files, options) => build(options));

program
  .command("dev")
  .description("Start dev servers with automatic port detection")
  .action(dev);

program.parse();
