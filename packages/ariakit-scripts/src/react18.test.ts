import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { expect, test } from "vitest";
import { getReact18Command } from "./react18.ts";

const cliPath = join(import.meta.dirname, "index.ts");

test("runs an explicit command with arguments", () => {
  expect(getReact18Command(["pnpm", "test", "--run"])).toEqual({
    bin: "pnpm",
    args: ["test", "--run"],
  });
});

test("throws when the command is missing", () => {
  expect(() => getReact18Command([])).toThrow(
    "Missing command. Use `ariakit react18 -- <command>`.",
  );
});

test("documents the explicit command syntax", () => {
  const commandHelp = execFileSync(
    process.execPath,
    [cliPath, "help", "react18"],
    { encoding: "utf-8" },
  );
  const programHelp = execFileSync(process.execPath, [cliPath, "--help"], {
    encoding: "utf-8",
  });

  expect(commandHelp).toContain(
    "Usage: ariakit react18 -- <command> [args...]",
  );
  expect(programHelp).toContain(
    "Run `ariakit react18 -- <command>` in an isolated React 18 workspace",
  );
});
