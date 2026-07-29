import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import packageJson from "./package.json" with { type: "json" };

const rootDir = import.meta.dirname;
const oxlintBin = path.join(rootDir, "node_modules/.bin/oxlint");

// The oxlint commands the root manifest is expected to declare, in order.
const expectedOxlintCommands = [
  "oxlint --disable-nested-config --type-aware && oxfmt --check",
  "oxlint --disable-nested-config --fix && oxfmt && oxlint --disable-nested-config --type-aware",
  "oxlint --disable-nested-config --fix --no-error-on-unmatched-pattern",
];

// Flags of a writing and a check-only invocation, used by the behavior tests
// below. They only have to be representative: what those tests prove is that
// `oxlint.config.ts` does not turn type-aware rules on by itself, which no
// other flag can affect.
const writingFlags = ["--disable-nested-config", "--fix"];
const checkFlags = ["--disable-nested-config", "--type-aware"];

// `Locator` comes from a package that can never be installed, so TypeScript
// always degrades it to an error type that behaves like `any`. That is the same
// state a real source file ends up in when its workspace was skipped by a
// filtered install, which is how `@playwright/test` became unresolvable in
// https://github.com/ariakit/ariakit/issues/6928. The non-null assertion below
// is load-bearing once the type resolves, but under the degraded type the
// type-aware `no-unnecessary-type-assertion` rule reports it as unnecessary and
// auto-fixes it away. It is also the only `!` in the fixture, which is how the
// tests below detect that it was stripped.
const fixtureSource = `import type { Locator } from "@ariakit/definitely-not-installed";

declare const locator: Locator;
declare function toHaveAttribute(name: string, value: string): void;

export async function assertActiveDescendant() {
  toHaveAttribute("aria-activedescendant", (await locator.getAttribute("id"))!);
}
`;

interface Fixture extends Disposable {
  file: string;
}

/**
 * Writes the degraded-types fixture to a throwaway directory outside the
 * repository, so a leftover file can never affect a real lint or typecheck run.
 */
function createFixture(): Fixture {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ariakit-lint-"));
  const file = path.join(dir, "degraded-types.ts");
  fs.writeFileSync(file, fixtureSource);
  return {
    file,
    [Symbol.dispose]() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

/**
 * Runs oxlint from the repository root so it picks up `oxlint.config.ts` and
 * resolves the `oxlint-tsgolint` binary that backs the type-aware rules. Only
 * the fixture is ever passed as a path, so these tests cannot lint, and
 * therefore cannot rewrite, the repository itself.
 */
function runOxlint(flags: string[], file: string) {
  const args = [...flags, file];
  const result = spawnSync(oxlintBin, args, { cwd: rootDir, encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  return `${result.stdout}${result.stderr}`;
}

/**
 * Returns every command in the root manifest that mentions oxlint, across both
 * the npm scripts and the `lint-staged` pre-commit hook.
 */
function getOxlintCommands() {
  const commands = Object.values(packageJson.scripts);
  for (const value of Object.values(packageJson["lint-staged"])) {
    commands.push(...(Array.isArray(value) ? value : [value]));
  }
  return commands.filter((command) => command.includes("oxlint"));
}

// Pinned rather than parsed. Any new oxlint command, or any wrapper, flag or
// path form added to an existing one, changes this list and fails here, where
// someone has to decide whether the change is safe. Parsing the commands
// instead would mean modelling every shape a shell command can take, and
// silently ignoring the shapes it did not model.
test("the root manifest declares exactly these oxlint commands", () => {
  expect(getOxlintCommands()).toEqual(expectedOxlintCommands);
});

// Reads the manifest rather than the pinned list above, so that updating the
// pin to accept a manifest change cannot also wave this through. An
// unrecognized separator collapses a command into one segment and fails here,
// which is the safe direction.
test("no oxlint invocation that writes to disk enables type-aware rules", () => {
  const writingSegments = getOxlintCommands()
    .flatMap((command) => command.split("&&"))
    // `--fix` is a prefix of `--fix-suggestions` and `--fix-dangerously`, the
    // only other oxlint flags that write to disk.
    .filter((segment) => segment.includes("--fix"));
  // Without this the test would report green while asserting nothing, should a
  // future manifest stop spelling its writing invocations this way.
  expect(writingSegments).not.toHaveLength(0);
  for (const segment of writingSegments) {
    expect(segment).not.toContain("--type-aware");
  }
});

test("oxlint.config.ts does not enable type-aware rules on a writing run", () => {
  using fixture = createFixture();
  runOxlint(writingFlags, fixture.file);
  expect(fs.readFileSync(fixture.file, "utf8")).toBe(fixtureSource);
});

// Guards the test above against passing for the wrong reason. If oxlint stopped
// fixing this pattern, that assertion would hold even with type-aware rules
// re-enabled on a writing command.
test("the same writing run does rewrite the fixture with --type-aware", () => {
  using fixture = createFixture();
  runOxlint([...writingFlags, "--type-aware"], fixture.file);
  expect(fs.readFileSync(fixture.file, "utf8")).not.toContain("!");
});

test("the check-only pass still reports type-aware violations", () => {
  using fixture = createFixture();
  const output = runOxlint(checkFlags, fixture.file);
  expect(output).toContain("typescript(no-unnecessary-type-assertion)");
  expect(fs.readFileSync(fixture.file, "utf8")).toBe(fixtureSource);
});
