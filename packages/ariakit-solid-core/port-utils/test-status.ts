// run this: `bun test-status`

import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
// @ts-expect-error No Bun types for now.
import { $ } from "bun";
import { log, space } from "./shared.ts";

const ROOT_PATH = (await $`git rev-parse --show-toplevel`.text()).trim();
const EXAMPLES_PATH = resolve(ROOT_PATH, "examples");

async function getDirs(dir: string) {
  const dirs = await readdir(dir);
  return dirs.filter((dir) => !dir.includes("."));
}

const EXAMPLES_DIRS = await getDirs(EXAMPLES_PATH);

type Match = "react" | "solid" | "both" | "none";
type Tree = Record<string, { unit: Match; example: Match }>;

type AllowedTestLoader = "react" | "solid";

function parseFixture(filename?: string) {
  if (!filename) return false;
  const match = filename.match(
    // @ts-expect-error Test runner is not limited by ES2017 target.
    /examples\/(?<dir>.*)\/(?<type>unit|index)\.((?<loader>react|solid)\.)?tsx$/,
  );
  if (!match?.groups) return false;
  const { dir, loader, type } = match.groups;
  if (!dir) return false;
  return {
    loader: (loader ?? "react") as AllowedTestLoader,
    unit: type === "unit",
  };
}

async function getTree() {
  const tree: Tree = {};
  for (const dir of EXAMPLES_DIRS) {
    const files = await readdir(resolve(EXAMPLES_PATH, dir));
    for (const file of files) {
      const fullPath = resolve(EXAMPLES_PATH, dir, file);
      const result = parseFixture(fullPath);
      if (!result) continue;
      const { loader, unit } = result;
      tree[dir] ??= { unit: "none", example: "none" };
      const current = tree[dir]!;
      if (unit) {
        if (current.unit === "both") continue;
        if (current.unit === "none") {
          current.unit = loader;
          continue;
        }
        current.unit = current.unit !== loader ? "both" : current.unit;
      } else {
        if (current.example === "both") continue;
        if (current.example === "none") {
          current.example = loader;
          continue;
        }
        current.example = current.example !== loader ? "both" : current.example;
      }
    }
  }
  return tree;
}

const TREE = await getTree();

type DirMatch = Exclude<Match, "none"> | "partial";

function getDirInfo() {
  const dirInfo: Record<string, DirMatch> = {};
  const dirs = Object.keys(TREE);
  for (const dir of dirs) {
    let match: DirMatch;
    const dirValue = TREE[dir]!;
    const values = Object.values(dirValue).filter((value) => value !== "none");
    if (values.every((v) => v === "both")) match = "both";
    else if (values.every((v) => v === "react")) match = "react";
    else if (values.every((v) => v === "solid")) match = "solid";
    else match = "partial";
    dirInfo[dir] = match;
  }
  return dirInfo;
}

const DIR_INFO = getDirInfo();

const COLOR_BY_MATCH: Record<Match | DirMatch, string> = {
  both: "green",
  partial: "yellow",
  react: "red",
  solid: "blue",
  none: "gray",
};

function printTestSummary(depth = 0) {
  const dirs = Object.keys(TREE).filter((dir) => DIR_INFO[dir] !== "solid");
  const totalDirs = dirs.length;
  const totalDirsPorted = dirs.filter((dir) => DIR_INFO[dir] === "both").length;
  const totalDirsPartial = dirs.filter(
    (dir) => DIR_INFO[dir] === "partial",
    0,
  ).length;
  const totalDirsNotPorted = dirs.filter(
    (dir) => DIR_INFO[dir] === "react",
    0,
  ).length;

  log(`ported tests: ${totalDirsPorted}/${totalDirs}`, "green", depth);
  log(
    `(${((totalDirsPorted / totalDirs) * 100).toFixed(2)}%)`,
    "green",
    depth + 1,
  );
  if (totalDirsPartial) {
    log(
      `partially ported tests: ${totalDirsPartial}/${totalDirs}`,
      "yellow",
      depth,
    );
    log(
      `(${((totalDirsPartial / totalDirs) * 100).toFixed(2)}%)`,
      "yellow",
      depth + 1,
    );
  }
  log(`remaining tests: ${totalDirsNotPorted}/${totalDirs}`, "red", depth);
  log(
    `(${((totalDirsNotPorted / totalDirs) * 100).toFixed(2)}%)`,
    "red",
    depth + 1,
  );
}

function printTree(depth = 0) {
  for (const dir of Object.keys(TREE).sort()) {
    const dirMatch = DIR_INFO[dir]!;
    const dirColor = COLOR_BY_MATCH[dirMatch];
    log(dir, dirColor, depth);
    if (dirMatch === "partial") {
      const dirValue = TREE[dir]!;
      const unitColor = COLOR_BY_MATCH[dirValue.unit];
      if (dirValue.unit !== "none") {
        log("unit", unitColor, depth + 1);
      }
      const exampleColor = COLOR_BY_MATCH[dirValue.example];
      if (dirValue.example !== "none") {
        log("example", exampleColor, depth + 1);
      }
    }
  }
}

function printLegend(depth = 0) {
  log("fully ported", COLOR_BY_MATCH.both, depth);
  log("partially ported", COLOR_BY_MATCH.partial, depth);
  log("not ported yet", COLOR_BY_MATCH.react, depth);
}

function print() {
  space();
  log("> meaning of colors");
  space();
  printLegend(1);
  space();
  log("> test port summary");
  space();
  printTestSummary(1);
  space();
  log("> ported tests");
  space();
  printTree(1);
}

print();
