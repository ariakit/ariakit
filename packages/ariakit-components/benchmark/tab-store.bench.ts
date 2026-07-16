import { createTabStore } from "@ariakit/components/tab/tab-store";
import { init } from "@ariakit/store";
import { afterAll, bench, vi } from "vitest";

// CI compares these benchmarks across paired baseline/current rounds with a
// ±10% significance gate (see `ariakit perf-compare --node`). This 1500/400ms
// budget was validated to stay well under that gate for unchanged code;
// re-validate run-to-run noise before reducing it further.
const options = {
  time: 1500,
  warmupTime: 400,
};

const tabCount = 200;
const items = Array.from({ length: tabCount }, (_, index) => ({
  id: `tab-${index + 1}`,
}));

const previousId = `tab-${tabCount - 1}`;
const lastId = `tab-${tabCount}`;
vi.stubGlobal("requestAnimationFrame", () => 0);
vi.stubGlobal("cancelAnimationFrame", () => {});
const stops = Array.from({ length: 64 }, () => {
  const store = createTabStore({
    defaultActiveId: previousId,
    defaultItems: items,
    defaultSelectedId: previousId,
  });
  const stop = init(store);
  store.setState("renderedItems", items);
  return { store, stop };
});

let nextId = lastId;
let sink: unknown;

bench(
  "render 200 new tab items",
  () => {
    const store = createTabStore();
    for (const item of items) {
      store.renderItem(item);
    }
    sink = store.item(lastId);
  },
  options,
);

bench(
  "move when selected tab follows active tab",
  async () => {
    for (const { store } of stops) {
      store.move(nextId);
    }
    await Promise.resolve();
    nextId = nextId === lastId ? previousId : lastId;
    sink = stops[0]?.store.getState().selectedId;
  },
  options,
);

afterAll(() => {
  for (const { stop } of stops) {
    stop();
  }
  vi.unstubAllGlobals();
});

export { sink };
