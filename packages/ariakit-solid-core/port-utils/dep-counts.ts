// run this: `bun dep-counts`
// options:
// --resolved (-r): print resolved dep counts
// --ascending (-a): sort by dep count in ascending order
// --descending (-d): sort by dep count in descending order

import { parseArgs } from "node:util";
// @ts-expect-error No Bun types for now.
import Bun from "bun";
import {
  getDepCounts,
  getDeps,
  getResolvedDepCounts,
  getResolvedDeps,
} from "./lib/deps.ts";
import { c, log, space } from "./lib/log.ts";
import { getFlatStatusTree } from "./lib/status.ts";

async function printDepCounts(
  resolved = false,
  ascending = false,
  descending = false,
) {
  const flatStatusTree = await getFlatStatusTree();
  const depCounts = resolved
    ? await getResolvedDepCounts()
    : await getDepCounts();
  const allDeps = resolved ? await getResolvedDeps() : await getDeps();

  const sortedComponents = Object.keys(depCounts).sort((a, b) => {
    if (ascending) return depCounts[a]! - depCounts[b]!;
    if (descending) return depCounts[b]! - depCounts[a]!;
    return a.localeCompare(b);
  });

  const maxDepCount = Math.max(...Object.values(depCounts));
  const maxDepCountLength = String(maxDepCount).length;
  const maxComponentLength = Math.max(
    ...sortedComponents.map((component) => component.length),
  );

  for (const component of sortedComponents) {
    const count = depCounts[component];
    const deps = allDeps[component.split("/")[0]!]![component.split("/")[1]!]!;
    const portedDepCount = deps.filter(
      (dep: any) => flatStatusTree[dep] === "both",
    ).length;
    const status = flatStatusTree[component];
    const paddedComponent = component.padEnd(maxComponentLength, " ");
    if (count === 0) {
      log(
        `${c(paddedComponent, status === "both" ? "green" : "red")}     no deps`,
      );
    } else {
      const portedDepCountPadded = String(portedDepCount).padStart(
        maxDepCountLength,
        " ",
      );
      const countPadded = String(count).padStart(maxDepCountLength, " ");
      const portedColor =
        portedDepCount === count
          ? "green"
          : portedDepCount === 0
            ? "red"
            : "yellow";
      log(
        `${c(paddedComponent, status === "both" ? "green" : "red")}     ${c(portedDepCountPadded, portedColor)} / ${countPadded}`,
      );
    }
  }
}

async function print() {
  const {
    values: { resolved, ascending, descending },
  } = parseArgs({
    args: Bun.argv,
    options: {
      resolved: { type: "boolean", short: "r", default: false },
      ascending: { type: "boolean", short: "a", default: false },
      descending: { type: "boolean", short: "d", default: false },
    },
    strict: true,
    allowPositionals: true,
  });

  space();
  log(`> Dependency counts (ported/total${resolved ? ", resolved" : ""})`);
  space();
  await printDepCounts(resolved, ascending, descending);
}

await print();
