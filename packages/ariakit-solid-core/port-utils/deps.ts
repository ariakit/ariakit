// run this: `bun deps [component/subcomponent]`
// options:
// --resolved (-r): print resolved deps

import { parseArgs } from "node:util";
// @ts-expect-error No Bun types for now.
import Bun from "bun";
import { getDeps, getResolvedDeps } from "./lib/deps.ts";
import { log, space } from "./lib/log.ts";
import { getFlatStatusTree } from "./lib/status.ts";

async function printDeps(component: string, resolved = false) {
  const flatStatusTree = await getFlatStatusTree();
  const deps = resolved
    ? await getResolvedDeps(component)
    : await getDeps(component);

  const totalDeps = deps.length;
  const portedDepCount = deps.filter(
    (dep) => flatStatusTree[dep] === "both",
  ).length;
  if (portedDepCount === totalDeps) {
    log(`all ported! (${portedDepCount}/${totalDeps})`, "green", 1);
  } else if (portedDepCount) {
    log(`some ported (${portedDepCount}/${totalDeps})`, "yellow", 1);
  } else {
    log(`none ported (${totalDeps})`, "red", 1);
  }

  space();

  for (const dep of deps.sort()) {
    const status = flatStatusTree[dep];
    log(dep, status === "both" ? "green" : "red", 1);
  }
}

async function print() {
  const {
    values: { resolved },
    positionals,
  } = parseArgs({
    args: Bun.argv,
    options: { resolved: { type: "boolean", short: "r", default: false } },
    strict: true,
    allowPositionals: true,
  });
  const component = positionals[2];
  if (!component) throw new Error("Component is required");

  space();
  log(`> ${component} deps${resolved ? " (resolved)" : ""}`);
  space();
  await printDeps(component, resolved);
}

await print();
