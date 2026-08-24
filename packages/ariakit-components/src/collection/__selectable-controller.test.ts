import { isApple } from "@ariakit/utils";
import { afterEach, expect, test, vi } from "vitest";
import type {
  SelectableBehavior,
  SelectableEvent,
  SelectableMode,
  SelectableRangeDelegate,
} from "./__selectable-controller.ts";
import { createSelectableController } from "./__selectable-controller.ts";
import type { CollectionStoreItem } from "./collection-store.ts";
import { createCollectionStore } from "./collection-store.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

interface HarnessOptions {
  behavior?: SelectableBehavior;
  getSelectionKey?: (id: string) => string | null | undefined;
  items?: CollectionStoreItem[];
  keys?: readonly string[];
  mode?: SelectableMode;
  normalizeKeys?: (keys: readonly string[]) => readonly string[];
  onBeforeSetKeys?: () => void;
  onSetKeys?: (
    keys: readonly string[],
    previousKeys: readonly string[],
    setExternalKeys: (keys: readonly string[]) => void,
  ) => void;
  rangeDelegate?: SelectableRangeDelegate | null;
  renderedIds?: readonly string[];
  requireOptIn?: boolean;
}

function createHarness(options: HarnessOptions = {}) {
  let behavior = options.behavior ?? "replace";
  let keys = options.keys ?? [];
  let mode = options.mode ?? "multiple";
  let listener: ((keys: readonly string[]) => void) | undefined;
  let writes = 0;
  const items =
    options.items ??
    Array.from({ length: 10 }, (_, index) => ({
      id: String(index + 1),
    }));
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const collection = createCollectionStore({ defaultItems: items });

  const setRenderedIds = (ids: readonly string[]) => {
    const renderedItems = ids.flatMap((id) => {
      const item = itemsById.get(id);
      return item ? [item] : [];
    });
    collection.setState("renderedItems", renderedItems);
  };

  setRenderedIds(options.renderedIds ?? items.map((item) => item.id));

  const controller = createSelectableController({
    collection,
    getBehavior: () => behavior,
    getCursorId: () => undefined,
    getKeys: () => keys,
    getMode: () => mode,
    getSelectionKey: options.getSelectionKey ?? ((id) => id),
    rangeDelegate: options.rangeDelegate,
    requireOptIn: options.requireOptIn ?? false,
    setKeys: (nextKeys) => {
      writes += 1;
      options.onBeforeSetKeys?.();
      const previousKeys = keys;
      keys = options.normalizeKeys?.(nextKeys) ?? nextKeys;
      listener?.(keys);
      options.onSetKeys?.(keys, previousKeys, (externalKeys) => {
        keys = externalKeys;
        listener?.(externalKeys);
      });
    },
    subscribeKeys: (nextListener) => {
      listener = nextListener;
      nextListener(keys);
      return () => {
        listener = undefined;
      };
    },
  });

  return {
    controller,
    externalSetKeys(nextKeys: readonly string[]) {
      keys = nextKeys;
      listener?.(nextKeys);
    },
    getKeys: () => keys,
    getWrites: () => writes,
    registerItem: collection.registerItem,
    setBehavior(nextBehavior: SelectableBehavior) {
      behavior = nextBehavior;
    },
    setMode(nextMode: SelectableMode) {
      mode = nextMode;
    },
    setRenderedIds,
  };
}

type Harness = ReturnType<typeof createHarness>;

interface EventOptions {
  detail?: number;
  modifier?: boolean;
  nativeEvent?: Event;
  pointerType?: string;
  shift?: boolean;
}

function createEvent(options: EventOptions = {}): SelectableEvent {
  const modifier = options.modifier ?? false;
  return {
    ctrlKey: modifier && !isApple(),
    detail: options.detail ?? 1,
    metaKey: modifier && isApple(),
    nativeEvent: options.nativeEvent,
    pointerType: options.pointerType,
    shiftKey: options.shift ?? false,
  };
}

function activate(harness: Harness, id: string, options?: EventOptions) {
  harness.controller.activate(id, createEvent(options));
}

function subtractRange(harness: Harness, id: string) {
  if (isApple()) {
    harness.controller.extendFrom(undefined, id, { additive: true });
    return;
  }
  activate(harness, id, { modifier: true, shift: true });
}

function expectSelected(harness: Harness, expectedKeys: readonly string[]) {
  expect(harness.getKeys()).toEqual(expectedKeys);
}

const allKeys = Array.from({ length: 10 }, (_, index) => String(index + 1));

test("replace sequence 1 reseats after a modifier activation", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "10", { shift: true });
  activate(harness, "5", { modifier: true });
  activate(harness, "7", { shift: true });
  expectSelected(harness, ["5", "6", "7"]);
});

// A pointer Shift range destroys the prior discontiguous group here. Finder,
// VS Code, and React Aria all preserve some of it under their distinct rules.
test("replace sequence 2 keeps the new modifier anchor", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  activate(harness, "5", { modifier: true });
  activate(harness, "7", { shift: true });
  expectSelected(harness, ["5", "6", "7"]);
});

test("replace sequence 3 anchors a deselected item", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "5", { shift: true });
  activate(harness, "5", { modifier: true });
  activate(harness, "3", { shift: true });
  expectSelected(harness, ["3", "4", "5"]);
});

test("replace sequence 4 contracts and reverses without moving the anchor", () => {
  const forward = createHarness();
  activate(forward, "1");
  activate(forward, "10", { shift: true });
  activate(forward, "5", { shift: true });
  expectSelected(forward, allKeys.slice(0, 5));

  const reverse = createHarness();
  activate(reverse, "5");
  activate(reverse, "8", { shift: true });
  activate(reverse, "2", { shift: true });
  expectSelected(reverse, allKeys.slice(1, 5));
});

test("toggle sequence 5 contracts and reverses from its base", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "2");
  activate(harness, "6", { shift: true });
  activate(harness, "4", { shift: true });
  expectSelected(harness, ["2", "3", "4"]);
  activate(harness, "1", { shift: true });
  expectSelected(harness, ["2", "1"]);
});

test("toggle sequence 6 restores a hole inside the new range", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "1");
  activate(harness, "10", { shift: true });
  activate(harness, "5", { modifier: true });
  activate(harness, "7", { shift: true });
  expectSelected(harness, ["1", "2", "3", "4", "6", "7", "8", "9", "10", "5"]);
});

test("toggle sequence 7 subtracts from the fixed base", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "1");
  activate(harness, "10", { shift: true });
  activate(harness, "5", { modifier: true });
  activate(harness, "7", { shift: true });
  subtractRange(harness, "8");
  expectSelected(harness, ["1", "2", "3", "4", "9", "10"]);
  subtractRange(harness, "7");
  expectSelected(harness, ["1", "2", "3", "4", "8", "9", "10"]);
});

test("replace sequence 8 adds a modified keyboard range", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  activate(harness, "5", { modifier: true });
  if (isApple()) {
    harness.controller.extendFrom(undefined, "7");
  } else {
    activate(harness, "7", { modifier: true, shift: true });
  }
  expectSelected(harness, ["1", "2", "3", "5", "6", "7"]);
  if (isApple()) {
    harness.controller.extendFrom(undefined, "6");
  } else {
    activate(harness, "6", { modifier: true, shift: true });
  }
  expectSelected(harness, ["1", "2", "3", "5", "6"]);
});

// Firefox applies its pointer-wipe policy to native keyboard ranges. Keeping a
// fixed base makes a held Shift+Arrow burst stable and reversible instead.
test("keyboard ranges preserve a prior group while reversing", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  activate(harness, "5", { modifier: true });

  harness.controller.extendFrom("5", "4");
  expectSelected(harness, ["1", "2", "3", "5", "4"]);
  harness.controller.extendFrom("4", "3");
  expectSelected(harness, ["1", "2", "3", "5", "4"]);
  harness.controller.extendFrom("3", "4");
  expectSelected(harness, ["1", "2", "3", "5", "4"]);
  harness.controller.extendFrom("4", "5");
  expectSelected(harness, ["1", "2", "3", "5"]);
});

test("keyboard ranges use the current collection order throughout a burst", () => {
  const harness = createHarness();
  activate(harness, "1");
  harness.controller.extendFrom("1", "3");
  expectSelected(harness, ["1", "2", "3"]);

  harness.setRenderedIds(["1", "3", "4", "2", "5"]);
  harness.controller.extendFrom("3", "4");
  expectSelected(harness, ["1", "3", "4"]);
});

test("virtual replace activations toggle, but virtual Shift extends", () => {
  const harness = createHarness();
  activate(harness, "1");
  activate(harness, "3", { detail: 0 });
  expectSelected(harness, ["1", "3"]);
  activate(harness, "5", { detail: 0, shift: true });
  expectSelected(harness, ["1", "3", "4", "5"]);
});

test.each(["touch", "pen"])(
  "%s replace activations degrade to toggling without moving a Shift anchor",
  (pointerType) => {
    const harness = createHarness();
    activate(harness, "1");
    activate(harness, "3", { pointerType, shift: true });
    expectSelected(harness, ["1", "3"]);
    activate(harness, "2", { shift: true });
    expectSelected(harness, ["1", "2"]);
  },
);

test("an unresolved Shift range selects the target without moving its anchor", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const harness = createHarness();
  activate(harness, "1");
  harness.setRenderedIds(["2", "3"]);
  activate(harness, "3", { shift: true });
  expectSelected(harness, ["1", "3"]);
  expect(warn).toHaveBeenCalledOnce();

  harness.setRenderedIds(["1", "2"]);
  activate(harness, "2", { shift: true });
  expectSelected(harness, ["1", "2"]);
});

test("a missing initial anchor selects and seats the destination", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "4", { shift: true });
  activate(harness, "6", { shift: true });
  expectSelected(harness, ["4", "5", "6"]);
});

test("fallback ranges locate endpoints before filtering eligibility", () => {
  const items = ["1", "separator", "2", "3"].map((id) => ({ id }));
  const harness = createHarness({
    getSelectionKey: (id) => (id === "separator" ? null : id),
    items,
  });
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "2", "3"]);
});

test("a non-selectable Shift destination preserves the existing anchor", () => {
  const harness = createHarness({ requireOptIn: true });
  harness.controller.setOptIn("1", true);
  harness.controller.setOptIn("2", false);
  harness.controller.setOptIn("3", true);
  harness.controller.setOptIn("4", true);

  activate(harness, "1");
  activate(harness, "2", { shift: true });
  expect(harness.getKeys()).toEqual(["1"]);
  activate(harness, "4", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "3", "4"]);
});

test("an initial non-selectable Shift destination seats the next range", () => {
  const harness = createHarness({ requireOptIn: true });
  harness.controller.setOptIn("1", false);
  harness.controller.setOptIn("2", true);
  harness.controller.setOptIn("3", true);

  activate(harness, "1", { shift: true });
  expect(harness.getKeys()).toEqual([]);
  activate(harness, "3", { shift: true });
  expect(harness.getKeys()).toEqual(["2", "3"]);
});

test("fallback ranges filter opt-ins before deduplicating selection keys", () => {
  const harness = createHarness({
    getSelectionKey: (id) => {
      if (id === "3" || id === "4") return "shared";
      return id;
    },
    requireOptIn: true,
  });
  harness.controller.setOptIn("1", true);
  harness.controller.setOptIn("2", false);
  harness.controller.setOptIn("3", true);
  harness.controller.setOptIn("4", true);

  activate(harness, "1");
  activate(harness, "4", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "shared"]);
});

test("controlled membership updates clear the fixed range base", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  harness.externalSetKeys(["8"]);
  activate(harness, "4", { shift: true });
  expectSelected(harness, ["8", "1", "2", "3", "4"]);
});

test("controlled rollback and echo preserve the fixed range base", () => {
  const harness = createHarness({ behavior: "toggle" });
  activate(harness, "1");
  activate(harness, "3", { shift: true });

  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3"]);
  activate(harness, "2", { shift: true });

  expectSelected(harness, ["1", "2"]);
});

test("deferred controlled rollback and echo preserve the fixed range base", async () => {
  let reconcile = false;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: (nextKeys, previousKeys, setExternalKeys) => {
      if (!reconcile) return;
      queueMicrotask(() => {
        setExternalKeys(previousKeys);
        queueMicrotask(() => setExternalKeys(nextKeys));
      });
    },
  });
  harness.controller.seat("1");
  reconcile = true;

  harness.controller.extendFrom("1", "3");
  await new Promise((resolve) => setTimeout(resolve, 0));
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2"]);
});

test("a synchronous rollback and echo settle the controlled transition", () => {
  let reconcile = true;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: (nextKeys, previousKeys, setExternalKeys) => {
      if (!reconcile) return;
      setExternalKeys(previousKeys);
      setExternalKeys(nextKeys);
    },
  });
  harness.controller.seat("1");
  harness.controller.extendFrom("1", "3");

  reconcile = false;
  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3"]);
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2", "3"]);
});

test("consecutive writes preserve their original controlled baseline", () => {
  const harness = createHarness({ behavior: "toggle", keys: ["1"] });
  harness.controller.seat("1");
  harness.controller.extendFrom("1", "3");
  harness.controller.extendFrom("3", "4");

  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3", "4"]);
  harness.controller.extendFrom("4", "2");

  expectSelected(harness, ["1", "2"]);
});

test("an outer error does not erase a nested transition", () => {
  let reenter = false;
  let harness: Harness;
  harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: () => {
      if (!reenter) return;
      reenter = false;
      harness.controller.extendFrom("2", "3");
      throw new Error("outer write failed");
    },
  });
  harness.controller.seat("1");
  reenter = true;

  expect(() => harness.controller.extendFrom("1", "2")).toThrow(
    "outer write failed",
  );
  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3"]);
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2"]);
});

test("an error before a write restores the previous transition", () => {
  let throwBeforeWrite = true;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onBeforeSetKeys: () => {
      if (!throwBeforeWrite) return;
      throw new Error("write failed");
    },
  });
  harness.controller.seat("1");

  expect(() => harness.controller.extendFrom("1", "3")).toThrow("write failed");
  throwBeforeWrite = false;
  harness.controller.extendFrom("1", "2");

  expectSelected(harness, ["1", "2"]);
});

test("an error after a write preserves its controlled transition", () => {
  let throwAfterWrite = true;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: () => {
      if (!throwAfterWrite) return;
      throw new Error("listener failed");
    },
  });
  harness.controller.seat("1");

  expect(() => harness.controller.extendFrom("1", "3")).toThrow(
    "listener failed",
  );
  throwAfterWrite = false;
  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3"]);
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2"]);
});

test("an error after a synchronous echo settles its transition", () => {
  let throwAfterWrite = true;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: (nextKeys, previousKeys, setExternalKeys) => {
      if (!throwAfterWrite) return;
      setExternalKeys(previousKeys);
      setExternalKeys(nextKeys);
      throw new Error("listener failed after echo");
    },
  });
  harness.controller.seat("1");

  expect(() => harness.controller.extendFrom("1", "3")).toThrow(
    "listener failed after echo",
  );
  throwAfterWrite = false;
  harness.externalSetKeys(["1"]);
  harness.externalSetKeys(["1", "2", "3"]);
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2", "3"]);
});

test("an error after rollback preserves a deferred controlled echo", async () => {
  let throwAfterRollback = true;
  const harness = createHarness({
    behavior: "toggle",
    keys: ["1"],
    onSetKeys: (nextKeys, previousKeys, setExternalKeys) => {
      if (!throwAfterRollback) return;
      setExternalKeys(previousKeys);
      queueMicrotask(() => setExternalKeys(nextKeys));
      throw new Error("listener failed after rollback");
    },
  });
  harness.controller.seat("1");

  expect(() => harness.controller.extendFrom("1", "3")).toThrow(
    "listener failed after rollback",
  );
  throwAfterRollback = false;
  await new Promise((resolve) => setTimeout(resolve, 0));
  harness.controller.extendFrom("3", "2");

  expectSelected(harness, ["1", "2"]);
});

test("synchronous controlled normalization updates the mirror and range base", () => {
  const harness = createHarness({
    behavior: "toggle",
    normalizeKeys: (keys) => keys.slice().reverse(),
  });
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  expectSelected(harness, ["3", "2", "1"]);
  expect(harness.controller.isSelected("3")).toBe(true);

  activate(harness, "4", { shift: true });
  expectSelected(harness, ["4", "1", "2", "3"]);
  expect(harness.controller.isSelected("4")).toBe(true);
});

// Chromium and WebKit move the native select anchor to the first item after
// select-all and answer {1,2,3}. The controller keeps cursor 6 as the anchor.
test.each(["replace", "toggle"] as const)(
  "selectAll resets the %s base to an empty snapshot",
  (behavior) => {
    const harness = createHarness({ behavior });
    harness.controller.seat("6");
    harness.controller.selectAll();
    expectSelected(harness, allKeys);
    activate(harness, "3", { shift: true });
    expectSelected(harness, ["3", "4", "5", "6"]);
  },
);

test("none mode freezes membership", () => {
  const harness = createHarness({ keys: ["2"], mode: "none" });
  activate(harness, "3");
  harness.controller.select("4");
  harness.controller.deselect("2");
  harness.controller.toggle("5");
  harness.controller.extendFrom("2", "6");
  harness.controller.selectAll();
  harness.controller.deselectAll();
  expect(harness.getKeys()).toEqual(["2"]);
});

test("single mode always replaces and selectAll uses the first key", () => {
  const harness = createHarness({ keys: ["8"], mode: "single" });
  activate(harness, "3", { detail: 0, modifier: true, shift: true });
  expect(harness.getKeys()).toEqual(["3"]);
  harness.controller.selectAll();
  expect(harness.getKeys()).toEqual(["1"]);
});

test("single-mode Shift preserves an existing anchor", () => {
  const harness = createHarness({ mode: "single" });
  activate(harness, "2");
  activate(harness, "5", { shift: true });
  expectSelected(harness, ["5"]);

  harness.setMode("multiple");
  activate(harness, "4", { shift: true });
  expectSelected(harness, ["2", "3", "4"]);
});

test.each([
  ["1", "3", "2"],
  ["3", "1", "2"],
])(
  "single mode Shift replaces forward or backward from %s through %s",
  (fromId, toId, finalId) => {
    const harness = createHarness({ mode: "single" });
    activate(harness, fromId, { shift: true });
    expect(harness.getKeys()).toEqual([fromId]);
    activate(harness, toId, { shift: true });
    expect(harness.getKeys()).toEqual([toId]);
    activate(harness, finalId, { shift: true });
    expect(harness.getKeys()).toEqual([finalId]);
  },
);

test("selection keys are unique when several ids map to one key", () => {
  const harness = createHarness({
    getSelectionKey: (id) => (id === "2" ? "same" : id === "3" ? "same" : id),
  });
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "same"]);
});

test("layered opt-ins preserve explicit false registrations", () => {
  const harness = createHarness({ requireOptIn: true });
  const removeFalse = harness.controller.setOptIn("2", false);
  expect(harness.controller.hasOptIn("2")).toBe(true);
  expect(harness.controller.isOptedIn("2")).toBe(false);
  expect(harness.controller.isSelectable("2")).toBe(false);

  const removeTrue = harness.controller.setOptIn("2", true);
  expect(harness.controller.isOptedIn("2")).toBe(true);
  expect(harness.controller.isSelectable("2")).toBe(true);
  removeTrue();
  expect(harness.controller.hasOptIn("2")).toBe(true);
  expect(harness.controller.isOptedIn("2")).toBe(false);
  removeFalse();
  expect(harness.controller.hasOptIn("2")).toBe(false);
});

test("an explicit false opt-in overrides fallback range eligibility", () => {
  const harness = createHarness({ requireOptIn: false });
  const removeFalse = harness.controller.setOptIn("2", false);
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "3"]);

  removeFalse();
  harness.controller.deselectAll();
  activate(harness, "1");
  activate(harness, "3", { shift: true });
  expect(harness.getKeys()).toEqual(["1", "2", "3"]);
});

test("activate and ignore deduplicate by native event identity", () => {
  const harness = createHarness({ behavior: "toggle" });
  const nativeEvent = new Event("click");
  const ignoredEvent = createEvent({ nativeEvent });
  expect(harness.controller.isIgnored(ignoredEvent)).toBe(false);
  harness.controller.ignore(ignoredEvent);
  const composedEvent = createEvent({ nativeEvent });
  expect(harness.controller.isIgnored(composedEvent)).toBe(true);
  harness.controller.activate("2", composedEvent);
  expect(harness.getKeys()).toEqual([]);

  const secondNativeEvent = new Event("click");
  expect(
    harness.controller.isIgnored(
      createEvent({ nativeEvent: secondNativeEvent }),
    ),
  ).toBe(false);
  harness.controller.activate(
    "2",
    createEvent({ nativeEvent: secondNativeEvent }),
  );
  harness.controller.activate(
    "2",
    createEvent({ nativeEvent: secondNativeEvent }),
  );
  expect(harness.getKeys()).toEqual(["2"]);
});

test("each range activation commits membership once", () => {
  const harness = createHarness();
  activate(harness, "1");
  const writes = harness.getWrites();
  activate(harness, "5", { shift: true });
  expect(harness.getWrites() - writes).toBe(1);
});

test("an explicit delegate is authoritative over mounted items", () => {
  const rangeDelegate: SelectableRangeDelegate = {
    getKeysInRange: (fromId, toId) => {
      if (fromId === "1" && toId === "5") return ["1", "2", "3", "4", "5"];
      return null;
    },
    getOrderedKeys: () => ["1", "2", "3", "4", "5"],
  };
  const harness = createHarness({ rangeDelegate, renderedIds: ["1", "5"] });
  activate(harness, "1");
  activate(harness, "5", { shift: true });
  expectSelected(harness, ["1", "2", "3", "4", "5"]);
});

test("delegate ranges return membership keys for unmounted item ids", () => {
  const selectionKeys = new Map([
    ["1", "Apple"],
    ["3", "Cherry"],
  ]);
  const rangeDelegate: SelectableRangeDelegate = {
    getKeysInRange: (fromId, toId) => {
      if (fromId === "1" && toId === "3") {
        return ["Apple", "Banana", "Cherry"];
      }
      return null;
    },
    getOrderedKeys: () => ["Apple", "Banana", "Cherry"],
  };
  const harness = createHarness({
    getSelectionKey: (id) => selectionKeys.get(id),
    rangeDelegate,
    renderedIds: ["1", "3"],
  });

  activate(harness, "1");
  activate(harness, "3", { shift: true });

  expectSelected(harness, ["Apple", "Banana", "Cherry"]);
});

test("an explicit delegate is authoritative over registered delegates", () => {
  const rangeDelegate: SelectableRangeDelegate = {
    getKeysInRange: () => ["1", "3", "5"],
    getOrderedKeys: () => ["1", "3", "5"],
  };
  const harness = createHarness({ rangeDelegate });
  harness.controller.addRangeDelegate({
    getKeysInRange: () => ["1", "2", "3", "4", "5"],
    getOrderedKeys: () => ["1", "2", "3", "4", "5"],
  });

  activate(harness, "1");
  activate(harness, "5", { shift: true });
  expectSelected(harness, ["1", "3", "5"]);

  harness.controller.deselectAll();
  harness.controller.selectAll();
  expectSelected(harness, ["1", "3", "5"]);
});

test("replace sequence 9 preserves unmounted values through a modified range", () => {
  const rangeDelegate: SelectableRangeDelegate = {
    getKeysInRange: (fromId, toId) => {
      const orderedIds = ["1", "2", "3", "4"];
      const fromIndex = orderedIds.indexOf(fromId);
      const toIndex = orderedIds.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return null;
      const startIndex = Math.min(fromIndex, toIndex);
      const endIndex = Math.max(fromIndex, toIndex);
      return orderedIds
        .slice(startIndex, endIndex + 1)
        .map((id) => `visible-${id}`);
    },
    getOrderedKeys: () => ["visible-1", "visible-2", "visible-3", "visible-4"],
  };
  const harness = createHarness({
    getSelectionKey: (id) => `visible-${id}`,
    keys: ["unmounted-a", "unmounted-b", "unmounted-c"],
    rangeDelegate,
  });

  activate(harness, "1", { modifier: true });
  activate(harness, "3", { shift: true });

  expectSelected(harness, [
    "unmounted-a",
    "unmounted-b",
    "unmounted-c",
    "visible-1",
    "visible-2",
    "visible-3",
  ]);
});

test("replace sequence 10 preserves unmounted values on replace", () => {
  const rangeDelegate: SelectableRangeDelegate = {
    getKeysInRange: (fromId, toId) => {
      if (fromId !== toId) return null;
      return [`visible-${fromId}`];
    },
    getOrderedKeys: () => ["visible-1", "visible-2", "visible-3", "visible-4"],
  };
  const harness = createHarness({
    getSelectionKey: (id) => `visible-${id}`,
    keys: ["unmounted-a", "unmounted-b", "unmounted-c"],
    rangeDelegate,
  });

  activate(harness, "2");

  expectSelected(harness, [
    "unmounted-a",
    "unmounted-b",
    "unmounted-c",
    "visible-2",
  ]);
});

test("registered delegates resolve ranges and unregister cleanly", () => {
  const harness = createHarness({ renderedIds: ["1", "5"] });
  const removeDelegate = harness.controller.addRangeDelegate({
    getKeysInRange: () => ["1", "2", "3", "4", "5"],
    getOrderedKeys: () => ["1", "2", "3", "4", "5"],
  });
  activate(harness, "1");
  activate(harness, "5", { shift: true });
  expectSelected(harness, ["1", "2", "3", "4", "5"]);

  removeDelegate();
  harness.controller.deselectAll();
  activate(harness, "1");
  activate(harness, "5", { shift: true });
  expectSelected(harness, ["1", "5"]);
});

test("selectAll preserves registration order between sibling delegates", () => {
  const harness = createHarness({ renderedIds: ["10"] });
  harness.controller.addRangeDelegate({
    getKeysInRange: () => null,
    getOrderedKeys: () => ["1", "2"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: () => null,
    getOrderedKeys: () => ["3", "4"],
  });

  harness.controller.selectAll();
  expect(harness.getKeys()).toEqual(["1", "2", "3", "4"]);
});

test("replace clears known selections across sibling delegates", () => {
  const harness = createHarness({ keys: ["1", "3"], renderedIds: ["1", "3"] });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && (fromId === "1" || fromId === "2")) {
        return [fromId];
      }
      return null;
    },
    getOrderedKeys: () => ["1", "2"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && (fromId === "3" || fromId === "4")) {
        return [fromId];
      }
      return null;
    },
    getOrderedKeys: () => ["3", "4"],
  });

  activate(harness, "3");

  expect(harness.getKeys()).toEqual(["3"]);
});

test("replace ranges clear known selections across sibling delegates", () => {
  const harness = createHarness({
    keys: ["1", "3"],
    renderedIds: ["1", "3", "4"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && (fromId === "1" || fromId === "2")) {
        return [fromId];
      }
      return null;
    },
    getOrderedKeys: () => ["1", "2"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      const orderedIds = ["3", "4"];
      const fromIndex = orderedIds.indexOf(fromId);
      const toIndex = orderedIds.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return null;
      return orderedIds.slice(
        Math.min(fromIndex, toIndex),
        Math.max(fromIndex, toIndex) + 1,
      );
    },
    getOrderedKeys: () => ["3", "4"],
  });
  harness.controller.seat("3");

  activate(harness, "4", { shift: true });

  expect(harness.getKeys()).toEqual(["3", "4"]);
});

test("ranges span sibling delegates in registration order", () => {
  const selectionKeys = new Map([
    ["first-id", "Apple"],
    ["last-id", "Date"],
  ]);
  const harness = createHarness({
    getSelectionKey: (id) => selectionKeys.get(id),
    items: [{ id: "first-id" }, { id: "last-id" }],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && fromId === "first-id") return ["Apple"];
      return null;
    },
    getOrderedKeys: () => ["Apple", "Banana"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && toId === "last-id") return ["Date"];
      return null;
    },
    getOrderedKeys: () => ["Carrot", "Date"],
  });

  activate(harness, "first-id");
  activate(harness, "last-id", { shift: true });

  expect(harness.getKeys()).toEqual(["Apple", "Banana", "Carrot", "Date"]);

  harness.controller.deselectAll();
  activate(harness, "last-id");
  activate(harness, "first-id", { shift: true });

  expect(harness.getKeys()).toEqual(["Apple", "Banana", "Carrot", "Date"]);
});

test("cross-delegate ranges refuse non-selectable endpoints safely", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const selectionKeys = new Map([["last-id", "Date"]]);
  const harness = createHarness({
    getSelectionKey: (id) => selectionKeys.get(id),
    items: [{ id: "last-id" }],
    keys: ["Kept"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && fromId === "separator-id") return [];
      return null;
    },
    getOrderedKeys: () => ["Apple", "Banana"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && toId === "last-id") return ["Date"];
      return null;
    },
    getOrderedKeys: () => ["Carrot", "Date"],
  });
  harness.controller.seat("separator-id");

  activate(harness, "last-id", { shift: true });

  expect(harness.getKeys()).toEqual(["Kept", "Date"]);
  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/could not be resolved/),
  );
});

test("registered delegates retain explicit range refusals", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const harness = createHarness({
    items: [{ id: "first" }, { id: "last" }],
    keys: ["Kept"],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId) return [fromId];
      return null;
    },
    getOrderedKeys: () => ["first", "last"],
  });
  harness.controller.seat("first");

  activate(harness, "last", { shift: true });

  expect(harness.getKeys()).toEqual(["Kept", "last"]);
  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/could not be resolved/),
  );
});

test("one delegate resolves ranges from non-selectable anchors", () => {
  const selectionKeys = new Map([["last-id", "Banana"]]);
  const harness = createHarness({
    getSelectionKey: (id) => selectionKeys.get(id),
    items: [{ id: "last-id" }],
  });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      if (fromId === toId && fromId === "separator-id") return [];
      if (fromId === "separator-id" && toId === "last-id") {
        return ["Banana"];
      }
      return null;
    },
    getOrderedKeys: () => ["Apple", "Banana"],
  });
  harness.controller.seat("separator-id");

  activate(harness, "last-id", { shift: true });

  expect(harness.getKeys()).toEqual(["Banana"]);
});

test("delegated anchors survive mounted item unregistration", () => {
  const selectionKeys = new Map([
    ["first-id", "Apple"],
    ["last-id", "Cherry"],
  ]);
  const harness = createHarness({
    getSelectionKey: (id) => selectionKeys.get(id),
    items: [],
  });
  const removeFirst = harness.registerItem({ id: "first-id" });
  const removeLast = harness.registerItem({ id: "last-id" });
  harness.controller.addRangeDelegate({
    getKeysInRange: (fromId, toId) => {
      const ids = ["first-id", "middle-id", "last-id"];
      const keys = ["Apple", "Banana", "Cherry"];
      const fromIndex = ids.indexOf(fromId);
      const toIndex = ids.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return null;
      return keys.slice(
        Math.min(fromIndex, toIndex),
        Math.max(fromIndex, toIndex) + 1,
      );
    },
    getOrderedKeys: () => ["Apple", "Banana", "Cherry"],
  });

  activate(harness, "first-id");
  removeFirst();
  activate(harness, "last-id", { shift: true });

  expect(harness.getKeys()).toEqual(["Apple", "Banana", "Cherry"]);
  removeLast();
});

test("duplicate delegate registrations clean up independently", () => {
  const harness = createHarness({ renderedIds: ["10"] });
  const delegate: SelectableRangeDelegate = {
    getKeysInRange: () => null,
    getOrderedKeys: () => ["1"],
  };
  const removeFirst = harness.controller.addRangeDelegate(delegate);
  const removeSecond = harness.controller.addRangeDelegate(delegate);

  removeFirst();
  harness.controller.selectAll();
  expect(harness.getKeys()).toEqual(["1"]);

  removeSecond();
  harness.controller.deselectAll();
  harness.controller.selectAll();
  expect(harness.getKeys()).toEqual(["10"]);
});

test("a delegate without ordered keys refuses unsafe replacement scopes", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const rangeDelegate = {
    getKeysInRange: () => ["2", "3"],
  };
  // @ts-expect-error Invalid JavaScript delegates are refused at runtime.
  const harness = createHarness({ keys: ["9"], rangeDelegate });
  harness.controller.selectAll();
  expect(harness.getKeys()).toEqual(["9"]);
  activate(harness, "2");
  expect(harness.getKeys()).toEqual(["9", "2"]);
  expect(warn).toHaveBeenCalledTimes(1);
});

test("reports unresolved ranges and missing ordered keys independently", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const rangeDelegate = {
    getKeysInRange: () => null,
  };
  // @ts-expect-error Invalid JavaScript delegates are refused at runtime.
  const harness = createHarness({ behavior: "toggle", rangeDelegate });

  activate(harness, "1");
  activate(harness, "3", { shift: true });
  harness.controller.selectAll();

  expect(warn).toHaveBeenCalledTimes(2);
  expect(warn.mock.calls[0]?.[0]).toMatch(/could not be resolved/);
  expect(warn.mock.calls[1]?.[0]).toMatch(/must implement getOrderedKeys/);
});
