// @vitest-environment node

import { afterEach, expect, test, vi } from "vitest";
import {
  createShortcutStore,
  unstable_getGlobalShortcutStore,
} from "./shortcut-store.ts";

const eagerStore = createShortcutStore({ platform: "other" });
const unregisterEagerCommand = eagerStore.registerCommand({
  command: "eager",
  keys: "Control+E",
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("supports an eager module-level command registration", () => {
  expect(eagerStore.getKeys("eager")).toEqual(["Control+E"]);
  unregisterEagerCommand();
});

test("uses other-platform defaults without accessing browser globals", () => {
  vi.stubGlobal("window", undefined);
  vi.stubGlobal("document", undefined);
  const store = createShortcutStore();

  expect(store.getState().platform).toBe("other");
  expect(store.getState().glyphs.Meta).toBe("Meta");
  expect(store.formatKeys("mod+K")).toBe("Ctrl+K");
});

test("creates the framework fallback lazily and once", () => {
  expect(unstable_getGlobalShortcutStore()).toBe(
    unstable_getGlobalShortcutStore(),
  );
});
