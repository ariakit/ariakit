import { readFile, writeFile } from "node:fs/promises";

const [kind, commit, ...extra] = process.argv.slice(2);
if (
  !["source", "workflow"].includes(kind) ||
  !/^[a-f0-9]{40}$/.test(commit ?? "") ||
  /^0+$/.test(commit) ||
  extra.length
) {
  throw new Error(
    "Usage: node .github/ariviso/pin.mjs source|workflow <full nonzero commit SHA>",
  );
}
const file = new URL(
  kind === "source"
    ? "../workflows/ariviso-capture.yml"
    : "../workflows/ariviso-diagnostic.yml",
  import.meta.url,
);
const before = await readFile(file, "utf8");
const pattern =
  kind === "source"
    ? /(?<=ARIVISO_EXECUTOR_SOURCE: ")[a-f0-9]{40}(?=")/g
    : /(?<=uses: ariakit\/ariakit\/\.github\/workflows\/ariviso-capture\.yml@)[a-f0-9]{40}/g;
if ([...before.matchAll(pattern)].length !== 1) {
  throw new Error(
    "The workflow must contain exactly one expected immutable pin",
  );
}
await writeFile(file, before.replace(pattern, commit));
console.log(
  `Updated the local ${kind} pin to ${commit}; no commit or push was made`,
);
