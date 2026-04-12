#!/usr/bin/env node

import { program } from "commander";
import { dev } from "./dev.ts";

program.name("ariakit");

program
  .command("dev")
  .description("Start dev servers with automatic port detection")
  .action(dev);

program.parse();
