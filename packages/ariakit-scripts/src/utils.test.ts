import { expect, test } from "vitest";
import { getCommandOutput } from "./utils.ts";

test("throws when the command is terminated by a signal", () => {
  const script = [
    'require("node:fs").writeSync(1, "partial output");',
    'process.kill(process.pid, "SIGTERM");',
  ].join("\n");

  expect(() =>
    getCommandOutput(process.execPath, ["-e", script], process.cwd()),
  ).toThrow("failed with SIGTERM");
});
