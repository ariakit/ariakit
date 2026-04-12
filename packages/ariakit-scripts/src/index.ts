#!/usr/bin/env node

const command = process.argv[2];

if (command === "dev") {
  await import("./dev.ts");
} else {
  console.error(
    command ? `Unknown command: ${command}` : "Usage: ariakit <dev>",
  );
  process.exit(1);
}
