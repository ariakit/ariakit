import { createDisclosureStore } from "@ariakit/components/disclosure/disclosure-store";
import { test } from "vitest";

// CI compares these benchmarks across paired baseline/current rounds with a
// ±10% significance gate (see `ariakit perf-compare --node`). This 1500/400ms
// budget was validated to stay well under that gate for unchanged code;
// re-validate run-to-run noise before reducing it further.
const options = {
  time: 1500,
  warmupTime: 400,
};

let sink: unknown;

test("create disclosure store", async ({ bench, task }) => {
  await bench(task.name, () => {
    const store = createDisclosureStore();
    sink = store.getState();
  }).run(options);
});

export { sink };
