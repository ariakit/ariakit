import {
  batch,
  createStore,
  init,
  mergeStore,
  pick,
  subscribe,
} from "@ariakit/store";
import { bench } from "vitest";

interface BenchmarkState {
  activeId: string | null;
  busy: boolean;
  count: number;
  disabled: boolean;
  focused: boolean;
  items: string[];
  mounted: boolean;
  open: boolean;
  selectedId: string | null;
  value: string;
}

const options = {
  time: 2000,
  warmupTime: 500,
};

const itemIds = Array.from({ length: 100 }, (_, index) => `item-${index}`);

const initialState: BenchmarkState = {
  activeId: null,
  busy: false,
  count: 0,
  disabled: false,
  focused: false,
  items: itemIds,
  mounted: false,
  open: false,
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

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

const readStore = createBenchmarkStore();
const updateStore = createBenchmarkStore();
const selectedSubscribersStore = createBenchmarkStore();
const unrelatedSubscribersStore = createBenchmarkStore();
const batchStore = createBenchmarkStore();
const parentStore = createBenchmarkStore();
const syncedStore = createStore({ ...initialState }, parentStore);

for (let i = 0; i < 200; i += 1) {
  subscribe(selectedSubscribersStore, ["count"], (state) => {
    consume(state.count);
  });
  subscribe(unrelatedSubscribersStore, ["activeId"], (state) => {
    consume(state.activeId);
  });
}

batch(batchStore, ["count", "value"], (state) => {
  consume(state.count);
});

init(syncedStore);

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
  "set synced parent state",
  async () => {
    syncedStore.setState("count", nextValue());
    await flushBatch();
    consume(parentStore.getState().count);
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

export { sink };
