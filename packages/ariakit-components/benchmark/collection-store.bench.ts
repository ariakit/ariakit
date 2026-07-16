import { createCollectionStore } from "@ariakit/components/collection/collection-store";
import { bench } from "vitest";

// CI compares these benchmarks across paired baseline/current rounds with a
// ±10% significance gate (see `ariakit perf-compare --node`). This 1500/400ms
// budget was validated to stay well under that gate for unchanged code;
// re-validate run-to-run noise before reducing it further.
const options = {
  time: 1500,
  warmupTime: 400,
};

const largeItems = Array.from({ length: 200 }, (_, index) => ({
  id: `item-${index + 1}`,
}));
const smallItems = largeItems.slice(0, 8);
const largeStore = createCollectionStore({ defaultItems: largeItems });

let sink: unknown;

bench(
  "render 200 new collection items",
  () => {
    const store = createCollectionStore();
    for (const item of largeItems) {
      store.renderItem(item);
    }
    sink = store.item("item-200");
  },
  options,
);

bench(
  "render 8 new collection items",
  () => {
    const store = createCollectionStore();
    for (const item of smallItems) {
      store.renderItem(item);
    }
    sink = store.item("item-8");
  },
  options,
);

bench(
  "register an existing item in a 200-item collection",
  () => {
    const restore = largeStore.registerItem({ id: "item-100" });
    sink = largeStore.item("item-100");
    restore();
  },
  options,
);

bench(
  "register an existing item in a new 200-item collection",
  () => {
    const store = createCollectionStore({ defaultItems: largeItems });
    const restore = store.registerItem({ id: "item-100" });
    sink = store.item("item-100");
    restore();
  },
  options,
);

export { sink };
