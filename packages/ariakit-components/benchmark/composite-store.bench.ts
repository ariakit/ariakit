import {
  createCompositeStore,
  groupItemsByRows,
} from "@ariakit/components/composite/composite-store";
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

bench(
  "repeatedly find the last enabled composite item",
  () => {
    for (let i = 0; i < itemCount; i += 1) {
      sink = store.last();
    }
  },
  options,
);

for (const rowCount of [1, 4, 10, 200]) {
  const gridItems = Array.from({ length: itemCount }, (_, index) => ({
    id: `grid-item-${rowCount}-${index + 1}`,
    rowId:
      rowCount === 1
        ? undefined
        : `row-${Math.floor((index * rowCount) / itemCount) + 1}`,
  }));
  const rowLabel = rowCount === 1 ? "row" : "rows";
  bench(
    `group 200 composite items into ${rowCount} ${rowLabel}`,
    () => {
      for (let i = 0; i < 50; i += 1) {
        sink = groupItemsByRows(gridItems);
      }
    },
    options,
  );
}

const smallGridItems = Array.from({ length: 8 }, (_, index) => ({
  id: `small-grid-item-${index + 1}`,
  rowId: `row-${Math.floor(index / 2) + 1}`,
}));
// Guard the small-item linear path against regressions.
bench(
  "group 8 composite items into 4 rows",
  () => {
    for (let i = 0; i < 50; i += 1) {
      sink = groupItemsByRows(smallGridItems);
    }
  },
  options,
);

const thresholdGridItems = Array.from({ length: 48 }, (_, index) => ({
  id: `threshold-grid-item-${index + 1}`,
  rowId: `row-${(index % 2) + 1}`,
}));
// Guard the threshold large-path, few-row case against regressions.
bench(
  "group 48 interleaved composite items into 2 rows",
  () => {
    for (let i = 0; i < 50; i += 1) {
      sink = groupItemsByRows(thresholdGridItems);
    }
  },
  options,
);

export { sink };
