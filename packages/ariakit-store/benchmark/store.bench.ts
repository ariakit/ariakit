import {
  batch,
  createStore,
  init,
  mergeStore,
  omit,
  pick,
  setup,
  subscribe,
  sync,
} from "@ariakit/store";
import { bench } from "vitest";

interface BenchmarkItem {
  id: string;
  value: string;
  disabled?: boolean;
}

interface BenchmarkState {
  activeId: string | null;
  activeValue?: string;
  animating: boolean;
  anchorElement: unknown;
  arrowElement: unknown;
  baseElement: unknown;
  busy: boolean;
  contentElement: unknown;
  count: number;
  disabled: boolean;
  disclosureElement: unknown;
  focused: boolean;
  focusLoop: boolean;
  focusWrap: boolean;
  items: BenchmarkItem[];
  mounted: boolean;
  moves: number;
  open: boolean;
  popoverElement: unknown;
  renderedItems: BenchmarkItem[];
  rtl: boolean;
  selectedId: string | null;
  value: string;
}

const options = {
  time: 2000,
  warmupTime: 500,
};

const itemIds = Array.from({ length: 100 }, (_, index) => `item-${index}`);
const items = itemIds.map((id) => ({ id, value: id }));
const itemById = new Map(items.map((item) => [item.id, item]));

const initialState: BenchmarkState = {
  activeId: null,
  activeValue: undefined,
  animating: false,
  anchorElement: null,
  arrowElement: null,
  baseElement: null,
  busy: false,
  contentElement: null,
  count: 0,
  disabled: false,
  disclosureElement: null,
  focused: false,
  focusLoop: true,
  focusWrap: true,
  items,
  mounted: false,
  moves: 0,
  open: false,
  popoverElement: null,
  renderedItems: items,
  rtl: false,
  selectedId: null,
  value: "",
};

let sink: unknown;
let counter = 0;

function consume(value: unknown) {
  sink = value;
}

function nextValue() {
  counter += 1;
  return counter;
}

function createBenchmarkStore(count = 0) {
  return createStore({ ...initialState, count });
}

function getItem(id: string | null) {
  if (id == null) return;
  return itemById.get(id);
}

function setupBenchmarkDerivedState(
  store: ReturnType<typeof createBenchmarkStore>,
) {
  setup(store, () =>
    sync(store, ["open", "animating"], (state) => {
      store.setState("mounted", state.open || state.animating);
    }),
  );

  setup(store, () =>
    sync(store, ["moves", "activeId"], (state, prevState) => {
      if (state.moves !== prevState.moves) return;
      store.setState("activeValue", undefined);
    }),
  );

  setup(store, () =>
    batch(store, ["moves", "renderedItems"], (state, prevState) => {
      if (state.moves === prevState.moves) return;
      const activeItem = getItem(state.activeId);
      store.setState("activeValue", activeItem?.value);
    }),
  );
}

function createMergedStoreChain(count = 0) {
  const externalStore = createBenchmarkStore(count);
  const tagStore = createBenchmarkStore(count);
  const popoverStore = createBenchmarkStore(count);
  const compositeStore = createBenchmarkStore(count);

  const mergedStore = mergeStore(
    externalStore,
    pick(tagStore, ["value", "rtl"]),
    omit(popoverStore, [
      "arrowElement",
      "anchorElement",
      "baseElement",
      "contentElement",
      "disclosureElement",
      "items",
      "popoverElement",
      "renderedItems",
    ]),
  );

  const store = createStore(
    {
      ...mergedStore.getState(),
      count,
      activeId: itemIds[0] ?? null,
    },
    compositeStore,
    mergedStore,
  );

  setupBenchmarkDerivedState(store);

  return { externalStore, popoverStore, store, tagStore };
}

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

const readStore = createBenchmarkStore();
const updateStore = createBenchmarkStore();
const selectedSubscribersStore = createBenchmarkStore();
const unrelatedSubscribersStore = createBenchmarkStore();
const reactSubscribersStore = createBenchmarkStore();
const batchStore = createBenchmarkStore();
const cascadingStore = createBenchmarkStore();
const parentStore = createBenchmarkStore();
const syncedStore = createStore({ ...initialState }, parentStore);
const mergedChain = createMergedStoreChain();

for (let i = 0; i < 200; i += 1) {
  subscribe(selectedSubscribersStore, ["count"], (state) => {
    consume(state.count);
  });
  subscribe(unrelatedSubscribersStore, ["activeId"], (state) => {
    consume(state.activeId);
  });
  subscribe(reactSubscribersStore, null, () => {
    consume(counter);
  });
}

batch(batchStore, ["count", "value"], (state) => {
  consume(state.count);
});

setupBenchmarkDerivedState(cascadingStore);

init(syncedStore);
init(cascadingStore);
init(mergedChain.store);

bench(
  "create store",
  () => {
    const store = createBenchmarkStore(nextValue());
    consume(store.getState());
  },
  options,
);

bench(
  "read state",
  () => {
    consume(readStore.getState());
  },
  options,
);

bench(
  "set state",
  async () => {
    updateStore.setState("count", nextValue());
    await flushBatch();
    consume(updateStore.getState().count);
  },
  options,
);

bench(
  "set state with selected subscribers",
  async () => {
    selectedSubscribersStore.setState("count", nextValue());
    await flushBatch();
  },
  options,
);

bench(
  "set state with unrelated subscribers",
  async () => {
    unrelatedSubscribersStore.setState("count", nextValue());
    await flushBatch();
    consume(unrelatedSubscribersStore.getState().count);
  },
  options,
);

bench(
  "batch multiple updates",
  async () => {
    const value = nextValue();
    batchStore.setState("count", value);
    batchStore.setState("value", String(value));
    await flushBatch();
  },
  options,
);

bench(
  "set synced child state",
  async () => {
    syncedStore.setState("count", nextValue());
    await flushBatch();
    consume(parentStore.getState().count);
  },
  options,
);

bench(
  "set synced source state",
  async () => {
    parentStore.setState("count", nextValue());
    await flushBatch();
    consume(syncedStore.getState().count);
  },
  options,
);

bench(
  "set state with React subscribers",
  async () => {
    reactSubscribersStore.setState(
      "activeId",
      itemIds[nextValue() % itemIds.length] ?? null,
    );
    await flushBatch();
  },
  options,
);

bench(
  "set unrelated state with React subscribers",
  async () => {
    reactSubscribersStore.setState("count", nextValue());
    await flushBatch();
  },
  options,
);

bench(
  "cascade setup listeners",
  async () => {
    const value = nextValue();
    cascadingStore.setState("open", value % 2 === 0);
    cascadingStore.setState(
      "activeId",
      itemIds[value % itemIds.length] ?? null,
    );
    cascadingStore.setState("moves", value);
    await flushBatch();
    consume(cascadingStore.getState().activeValue);
  },
  options,
);

bench(
  "create picked store",
  () => {
    const store = createBenchmarkStore(nextValue());
    const pickedStore = pick(store, ["count", "open", "value"]);
    const cleanup = init(pickedStore);
    consume(pickedStore?.getState());
    cleanup?.();
  },
  options,
);

bench(
  "initialize merged store chain",
  () => {
    const { store } = createMergedStoreChain(nextValue());
    const cleanup = init(store);
    consume(store.getState());
    cleanup();
  },
  options,
);

bench(
  "merge stores",
  () => {
    const firstStore = createStore({
      ...initialState,
      count: nextValue(),
      open: false,
    });
    const secondStore = createStore({
      ...initialState,
      mounted: true,
      value: "value",
    });
    consume(mergeStore(firstStore, secondStore).getState());
  },
  options,
);

bench(
  "set merged source state",
  async () => {
    mergedChain.externalStore.setState("count", nextValue());
    await flushBatch();
    consume(mergedChain.store.getState().count);
  },
  options,
);

bench(
  "set merged picked source state",
  async () => {
    mergedChain.tagStore.setState("value", String(nextValue()));
    await flushBatch();
    consume(mergedChain.store.getState().value);
  },
  options,
);

bench(
  "set merged omitted source state",
  async () => {
    mergedChain.popoverStore.setState("open", nextValue() % 2 === 0);
    await flushBatch();
    consume(mergedChain.store.getState().open);
  },
  options,
);

bench(
  "set merged derived state",
  async () => {
    const value = nextValue();
    mergedChain.store.setState("open", value % 2 === 0);
    mergedChain.store.setState(
      "activeId",
      itemIds[value % itemIds.length] ?? null,
    );
    mergedChain.store.setState("moves", value);
    await flushBatch();
    consume(mergedChain.store.getState().activeValue);
  },
  options,
);

export { sink };
