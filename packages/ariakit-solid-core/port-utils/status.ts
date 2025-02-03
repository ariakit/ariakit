// run this: `bun status`

import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
// @ts-expect-error No Bun types for now.
import { $ } from "bun";
import { log, space } from "./shared.ts";

const ROOT_PATH = (await $`git rev-parse --show-toplevel`.text()).trim();
const REACT_PATH = resolve(ROOT_PATH, "packages/ariakit-react-core/src");
const SOLID_PATH = resolve(ROOT_PATH, "packages/ariakit-solid-core/src");

async function getDirs(dir: string) {
  const dirs = await readdir(dir);
  return dirs.filter((dir) => !dir.includes("utils") && !dir.includes("."));
}

const REACT_DIRS = await getDirs(REACT_PATH);
const SOLID_DIRS = await getDirs(SOLID_PATH);

type FileMatch = "react" | "solid" | "both";
type Tree = Record<string, Record<string, FileMatch>>;

async function getTree() {
  const tree: Tree = {};
  for (const dir of REACT_DIRS) {
    tree[dir] ??= {};
    const files = await readdir(resolve(REACT_PATH, dir));
    for (const file of files) {
      const fullPath = resolve(REACT_PATH, dir, file);
      if (fullPath.includes("utils") || fullPath.includes("_")) continue;
      const cleanFile = file.replace(/\.tsx?$/, "");
      tree[dir][cleanFile] = "react";
    }
  }
  for (const dir of SOLID_DIRS) {
    tree[dir] ??= {};
    const files = await readdir(resolve(SOLID_PATH, dir));
    for (const file of files) {
      const fullPath = resolve(SOLID_PATH, dir, file);
      if (fullPath.includes("utils") || fullPath.includes("_")) continue;
      const cleanFile = file.replace(/\.tsx?$/, "");
      const isReactFile = tree[dir][cleanFile] === "react";
      tree[dir][cleanFile] = isReactFile ? "both" : "solid";
    }
  }
  return tree;
}

const TREE = await getTree();

type DirMatch = FileMatch | "partial";

function getDirInfo() {
  const dirInfo: Record<string, DirMatch> = {};
  const dirs = Object.keys(TREE);
  for (const dir of dirs) {
    let match: DirMatch;
    const dirValue = TREE[dir]!;
    const values = Object.values(dirValue);
    if (values.every((v) => v === "both")) match = "both";
    else if (values.every((v) => v === "react")) match = "react";
    else if (values.every((v) => v === "solid")) match = "solid";
    else match = "partial";
    dirInfo[dir] = match;
  }
  return dirInfo;
}

const DIR_INFO = getDirInfo();

const COLOR_BY_MATCH: Record<DirMatch, string> = {
  both: "green",
  partial: "yellow",
  react: "red",
  solid: "blue",
};

function printPortSummary(depth = 0) {
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

  log(`ported components: ${totalDirsPorted}/${totalDirs}`, "green", depth);
  log(
    `(${((totalDirsPorted / totalDirs) * 100).toFixed(2)}%)`,
    "green",
    depth + 1,
  );
  if (totalDirsPartial) {
    log(
      `partially ported components: ${totalDirsPartial}/${totalDirs}`,
      "yellow",
      depth,
    );
    log(
      `(${((totalDirsPartial / totalDirs) * 100).toFixed(2)}%)`,
      "yellow",
      depth + 1,
    );
  }
  log(`remaining components: ${totalDirsNotPorted}/${totalDirs}`, "red", depth);
  log(
    `(${((totalDirsNotPorted / totalDirs) * 100).toFixed(2)}%)`,
    "red",
    depth + 1,
  );

  space();

  const fileMatches = Object.values(TREE).reduce(
    (acc, dirValue) => {
      for (const file of Object.keys(dirValue)) {
        const fileMatch = dirValue[file]!;
        if (fileMatch === "solid") continue;
        acc[file] = fileMatch;
      }
      return acc;
    },
    {} as Record<string, FileMatch>,
  );
  const files = Object.keys(fileMatches);
  const totalFiles = files.length;
  const totalFilesPorted = files.filter(
    (file) => fileMatches[file] === "both",
  ).length;
  const totalFilesNotPorted = files.filter(
    (file) => fileMatches[file] === "react",
    0,
  ).length;

  log(
    `ported sub-components: ${totalFilesPorted}/${totalFiles}`,
    "green",
    depth,
  );
  log(
    `(${((totalFilesPorted / totalFiles) * 100).toFixed(2)}%)`,
    "green",
    depth + 1,
  );
  log(
    `remaining sub-components: ${totalFilesNotPorted}/${totalFiles}`,
    "red",
    depth,
  );
  log(
    `(${((totalFilesNotPorted / totalFiles) * 100).toFixed(2)}%)`,
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
      for (const file of Object.keys(dirValue).sort()) {
        const fileMatch = dirValue[file]!;
        const fileColor = COLOR_BY_MATCH[fileMatch];
        log(file, fileColor, depth + 1);
      }
    }
  }
}

function printLegend(depth = 0) {
  log("fully ported", COLOR_BY_MATCH.both, depth);
  log("partially ported", COLOR_BY_MATCH.partial, depth);
  log("not ported yet", COLOR_BY_MATCH.react, depth);
  log("new in Ariakit Solid", COLOR_BY_MATCH.solid, depth);
}

function print() {
  space();
  log("> meaning of colors");
  space();
  printLegend(1);
  space();
  log("> port summary");
  space();
  printPortSummary(1);
  space();
  log("> ported components");
  space();
  printTree(1);
}

print();
