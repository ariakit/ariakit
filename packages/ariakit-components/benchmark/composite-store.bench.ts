import { createCompositeStore } from "@ariakit/components/composite/composite-store";
import { bench } from "vitest";

// CI compares these benchmarks across paired baseline/current rounds with a
// ±10% significance gate (see `ariakit perf-compare --node`). This 1500/400ms
// budget was validated to stay well under that gate for unchanged code;
// re-validate run-to-run noise before reducing it further.
const options = {
  time: 1500,
  warmupTime: 400,
};

const itemCount = 200;
const items = Array.from({ length: itemCount }, (_, index) => ({
  id: `item-${index + 1}`,
}));
const activeIds = items.slice(0, -1).map((item) => item.id);

const store = createCompositeStore({ defaultItems: items });
store.setState("renderedItems", items);

const clonedStore = createCompositeStore({ defaultItems: items });
clonedStore.setState(
  "renderedItems",
  items.map((item) => ({ ...item })),
);

let sink: unknown;

bench(
  "move through composite items",
  () => {
    for (const activeId of activeIds) {
      sink = store.next({ activeId });
    }
  },
  options,
);

bench(
  "move through cloned composite items",
  () => {
    for (const activeId of activeIds) {
      sink = clonedStore.next({ activeId });
    }
  },
  options,
);

export { sink };
