#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build.ts";
import { dev } from "./dev.ts";

program.name("ariakit");

program
  .command("dev")
  .description("Start dev servers with automatic port detection")
  .action(dev);

program.command("build").description("Build packages").action(build);

program.parse();
