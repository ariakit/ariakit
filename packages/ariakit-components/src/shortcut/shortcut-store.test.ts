import { init, subscribe } from "@ariakit/store";
import { afterEach, expect, expectTypeOf, test, vi } from "vitest";
import type {
  ShortcutCommandOptions,
  ShortcutEvent,
  ShortcutProgrammaticEvent,
  ShortcutStore,
} from "./shortcut-store.ts";
import { createShortcutStore } from "./shortcut-store.ts";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length) {
    cleanups.pop()?.();
  }
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function register(store: ShortcutStore, options: ShortcutCommandOptions) {
  const cleanup = store.registerCommand(options);
  cleanups.push(cleanup);
  return cleanup;
}

function registerScope(
  store: ShortcutStore,
  options: Parameters<ShortcutStore["registerScope"]>[0],
) {
  const cleanup = store.registerScope(options);
  cleanups.push(cleanup);
  return cleanup;
}

function attach(store: ShortcutStore, targetDocument: Document) {
  const cleanup = store.attach(targetDocument);
  cleanups.push(cleanup);
  return cleanup;
}

function dispatchKey(
  target: Element,
  key: string,
  init: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    ...init,
  });
  const getModifierState = event.getModifierState.bind(event);
  Object.defineProperty(event, "getModifierState", {
    configurable: true,
    value: (modifier: string) => {
      if (modifier === "AltGraph") return false;
      return getModifierState(modifier);
    },
  });
  target.dispatchEvent(event);
  return event;
}

function nextTask() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function createHiddenMap(
  values: Record<string, string>,
  inherited: Record<string, string> = {},
) {
  const map: Record<string, string> = Object.create(inherited);
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(map, key, { value });
  }
  return map;
}

test("keeps snapshots stable and recomputes platform defaults", () => {
  const store = createShortcutStore({ platform: "apple" });
  const first = store.getState();

  expect(store.getState()).toBe(first);
  expect(first.glyphs.Meta).toBe("⌘");
  expect(store.unstable_hasExplicitPlatform).toBe(true);

  store.setState("platform", "windows");
  const second = store.getState();

  expect(second).not.toBe(first);
  expect(store.getState()).toBe(second);
  expect(second.glyphs.Meta).toBe("Win");
  expect(second.keyNames.Meta).toBeUndefined();
  expect(store.formatKeys("mod+K")).toBe("Ctrl+K");
  expect(
    store.formatKeys("mod+K", {
      platform: "apple",
      joiner: "/",
    }),
  ).toBe("⌘/K");
});

test("formats non-enumerable own store glyphs and key names", () => {
  const store = createShortcutStore({
    platform: "windows",
    glyphs: createHiddenMap({ K: "κ" }, { K: "Inherited glyph" }),
    keyNames: createHiddenMap({ K: "Kappa" }, { K: "Inherited name" }),
  });

  expect(store.formatKeys("k")).toBe("κ");
  expect(store.unstable_getKeyTokens("k")[0]?.keys[0]).toMatchObject({
    text: "κ",
    name: "Kappa",
  });
});

test("preserves inherited map and per-call formatting precedence", () => {
  const parent = createShortcutStore({
    platform: "windows",
    glyphs: createHiddenMap({ Meta: "M", K: "κ" }, { Alt: "Inherited glyph" }),
    keyNames: createHiddenMap(
      { Meta: "Super", K: "Kappa" },
      { Alt: "Inherited name" },
    ),
  });
  const child = createShortcutStore({ unstable_parent: parent });
  const options = {
    platform: "apple" as const,
    glyphs: createHiddenMap({ K: "χ" }),
    keyNames: createHiddenMap({ K: "Chi" }),
  };

  expect(child.formatKeys("alt+meta+k", options)).toBe("⌥Mχ");
  expect(child.unstable_getKeyTokens("alt+meta+k", options)[0]?.keys).toEqual([
    { value: "Alt", text: "⌥", modifier: true },
    { value: "Meta", text: "M", name: "Super", modifier: true },
    { value: "K", text: "χ", name: "Chi", modifier: false },
  ]);
});

test("reports a platform set after creation as explicit", () => {
  const store = createShortcutStore();

  expect(store.unstable_hasExplicitPlatform).toBe(false);

  store.setState("platform", "windows");

  expect(store.unstable_hasExplicitPlatform).toBe(true);
});

test("does not notify registry subscribers for unchanged state", () => {
  const explicitStore = createShortcutStore({ platform: "windows" });
  const explicitListener = vi.fn();
  const unsubscribeExplicit =
    explicitStore.unstable_subscribeRegistry(explicitListener);
  cleanups.push(unsubscribeExplicit);
  const initialVersion = explicitStore.unstable_getRegistryVersion();
  const updater = vi.fn((enabled: boolean) => enabled);

  explicitStore.setState("platform", "windows");
  explicitStore.setState("enabled", updater);

  expect(updater).toHaveBeenCalledOnce();
  expect(explicitListener).not.toHaveBeenCalled();
  expect(explicitStore.unstable_getRegistryVersion()).toBe(initialVersion);

  const implicitStore = createShortcutStore();
  const implicitListener = vi.fn();
  const unsubscribeImplicit =
    implicitStore.unstable_subscribeRegistry(implicitListener);
  cleanups.push(unsubscribeImplicit);
  const platform = implicitStore.getState().platform;

  implicitStore.setState("platform", platform);
  expect(implicitListener).toHaveBeenCalledOnce();
  expect(implicitStore.unstable_hasExplicitPlatform).toBe(true);

  implicitStore.setState("platform", platform);
  expect(implicitListener).toHaveBeenCalledOnce();
});

test("evaluates state updaters against effective inherited state", () => {
  const parent = createShortcutStore({ enabled: false });
  const child = createShortcutStore({ unstable_parent: parent });
  const updater = vi.fn((enabled: boolean) => !enabled);

  child.setEnabled(updater);

  expect(updater).toHaveBeenCalledWith(false);
  expect(child.getState().enabled).toBe(false);

  parent.setEnabled(true);

  expect(child.getState().enabled).toBe(true);
});

test("notifies ordinary store subscribers about inherited state", () => {
  const parent = createShortcutStore({ platform: "apple" });
  const child = createShortcutStore({ unstable_parent: parent });
  const listener = vi.fn();
  const unsubscribe = subscribe(
    child,
    ["platform", "glyphs", "keyNames"],
    listener,
  );
  cleanups.push(unsubscribe);

  parent.setState("platform", "windows");

  expect(listener).toHaveBeenCalledOnce();
  expect(listener.mock.calls[0]?.[0]).toMatchObject({
    platform: "windows",
    glyphs: { Meta: "Win" },
  });
  expect(listener.mock.calls[0]?.[0]?.keyNames.Control).toBeUndefined();
  expect(listener.mock.calls[0]?.[1]).toMatchObject({
    platform: "apple",
    glyphs: { Meta: "⌘" },
    keyNames: { Control: "Control" },
  });
  expect(child.getState().platform).toBe("windows");
});

test("notifies ordinary subscribers from the initial effective state", () => {
  const parent = createShortcutStore({ enabled: false });
  const child = createShortcutStore({ unstable_parent: parent });
  const listener = vi.fn();
  const unsubscribe = subscribe(child, ["enabled"], listener);
  cleanups.push(unsubscribe);

  parent.setEnabled(true);

  expect(listener).toHaveBeenCalledOnce();
  expect(listener.mock.calls[0]?.[0]).toMatchObject({ enabled: true });
  expect(listener.mock.calls[0]?.[1]).toMatchObject({ enabled: false });
});

test("allows originalEvent to be omitted from programmatic shortcut events", () => {
  expectTypeOf<ShortcutProgrammaticEvent>().toMatchTypeOf<{
    source: "programmatic";
    originalEvent?: undefined;
  }>();
  const event: ShortcutProgrammaticEvent = {
    source: "programmatic",
    keys: "",
    target: null,
  };

  expect(event.originalEvent).toBeUndefined();
});

test("inherits custom maps across a child platform override", () => {
  const parent = createShortcutStore({
    platform: "apple",
    glyphs: { Meta: "M" },
    keyNames: { Meta: "Super" },
  });
  const child = createShortcutStore({
    unstable_parent: parent,
    platform: "windows",
  });

  expect(child.getState().glyphs.Meta).toBe("M");
  expect(child.getState().keyNames.Meta).toBe("Super");
  expect(child.formatKeys("mod+K")).toBe("Ctrl+K");
  expect(
    child.formatKeys("mod+K", {
      platform: "apple",
      joiner: "/",
    }),
  ).toBe("M/K");
  expect(child.unstable_getKeyTokens("mod+K")[0]).toMatchObject({
    value: "Control+K",
    joiner: "+",
  });
});

test("preserves base store internals and wrapper-safe parent identity", () => {
  const parent = createShortcutStore({ platform: "windows" });
  const wrapper = { ...parent };
  const child = createShortcutStore({ unstable_parent: wrapper });
  const stop = init(child);
  cleanups.push(stop);

  expect(child.getState().platform).toBe("windows");
  expect(child.unstable_parent).toBe(wrapper);
  expect(child.unstable_getStore()).toBe(child);
});

test("merges named declarations and uses the highest live reference", async () => {
  const store = createShortcutStore({ platform: "windows" });
  const first = document.createElement("button");
  const second = document.createElement("button");
  document.body.append(first, second);
  const calls: string[] = [];
  first.addEventListener("click", () => calls.push("first"));
  second.addEventListener("click", () => calls.push("second"));

  register(store, { command: "save", keys: "mod+S" });
  const removeHandler = register(store, {
    command: "save",
    onTrigger: () => calls.push("handler"),
  });
  register(store, {
    command: "save",
    unstable_getElement: () => first,
  });
  register(store, {
    command: "save",
    unstable_getElement: () => second,
  });

  dispatchKey(document.body, "s", { code: "KeyS", ctrlKey: true });
  expect(calls).toEqual(["handler"]);

  removeHandler();
  await nextTask();
  dispatchKey(document.body, "s", { code: "KeyS", ctrlKey: true });
  expect(calls).toEqual(["handler", "second"]);

  second.disabled = true;
  await nextTask();
  dispatchKey(document.body, "s", { code: "KeyS", ctrlKey: true });
  expect(calls).toEqual(["handler", "second", "first"]);
});

test("does not run a disabled merged handler and falls back to a reference", () => {
  const store = createShortcutStore();
  const button = document.createElement("button");
  document.body.append(button);
  const calls: string[] = [];
  button.addEventListener("click", () => calls.push("reference"));

  register(store, {
    command: "save",
    keys: "Control+S",
    enabled: false,
    onTrigger: () => calls.push("handler"),
  });
  register(store, {
    command: "save",
    unstable_getElement: () => button,
  });

  dispatchKey(document.body, "s", { ctrlKey: true });

  expect(calls).toEqual(["reference"]);
});

test("warns only for genuinely different concurrent declarations", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const store = createShortcutStore({ platform: "windows" });

  register(store, { command: "save", keys: "control+s" });
  register(store, { command: "save", keys: "Control+S" });

  expect(consoleWarn).not.toHaveBeenCalled();

  register(store, { command: "save", keys: "Alt+S" });

  expect(consoleWarn).toHaveBeenCalledOnce();
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('declarations for "keys"'),
  );
});

test("warns about conflicts before a nested store activates", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const parent = createShortcutStore();
  const child = createShortcutStore({
    unstable_deferActivation: true,
    unstable_parent: parent,
  });

  register(child, { command: "save", keys: "Control+S" });
  register(child, { command: "save", keys: "Alt+S" });

  expect(consoleWarn).toHaveBeenCalledOnce();
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('declarations for "keys"'),
  );
});

test.each(["middle", "inner"] as const)(
  "warns about deferred ancestor conflicts when the %s store registers first",
  (firstStore) => {
    using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const root = createShortcutStore();
    const middle = createShortcutStore({
      unstable_deferActivation: true,
      unstable_parent: root,
    });
    const inner = createShortcutStore({
      unstable_deferActivation: true,
      unstable_parent: middle,
    });
    const registerMiddle = () => {
      register(middle, { command: "save", keys: "Control+S" });
    };
    const registerInner = () => {
      register(inner, { command: "save", keys: "Alt+S" });
    };

    if (firstStore === "middle") {
      registerMiddle();
      registerInner();
    } else {
      registerInner();
      registerMiddle();
    }

    expect(consoleWarn).not.toHaveBeenCalled();

    cleanups.push(init(inner));
    expect(consoleWarn).not.toHaveBeenCalled();

    cleanups.push(init(middle));
    expect(consoleWarn).toHaveBeenCalledOnce();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('declarations for "keys"'),
    );
  },
);

test.each(["parent", "child"] as const)(
  "warns once when the active %s declaration registers first",
  (firstStore) => {
    using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const parent = createShortcutStore();
    const child = createShortcutStore({
      unstable_deferActivation: true,
      unstable_parent: parent,
    });
    const registerParent = () => {
      register(parent, { command: "save", keys: "Control+S" });
    };
    const registerChild = () => {
      register(child, { command: "save", keys: "Alt+S" });
    };

    if (firstStore === "parent") {
      registerParent();
      registerChild();
    } else {
      registerChild();
      registerParent();
    }

    expect(consoleWarn).not.toHaveBeenCalled();

    cleanups.push(init(child));
    expect(consoleWarn).toHaveBeenCalledOnce();
  },
);

test("does not warn when deferred sibling stores activate", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const root = createShortcutStore();
  const first = createShortcutStore({
    unstable_deferActivation: true,
    unstable_parent: root,
  });
  const second = createShortcutStore({
    unstable_deferActivation: true,
    unstable_parent: root,
  });

  register(first, { command: "save", keys: "Control+S" });
  register(second, { command: "save", keys: "Alt+S" });
  cleanups.push(init(first));
  cleanups.push(init(second));

  expect(consoleWarn).not.toHaveBeenCalled();
});

test("warns once per activation for a deferred runtime conflict", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const parent = createShortcutStore();
  const child = createShortcutStore({
    unstable_deferActivation: true,
    unstable_parent: parent,
  });
  register(parent, { command: "save", keys: "Control+S" });
  register(child, { command: "save", keys: "Alt+S" });

  const deactivate = init(child);
  cleanups.push(deactivate);
  expect(consoleWarn).toHaveBeenCalledOnce();

  deactivate();
  cleanups.push(init(child));
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("treats scope arrays as identity sets for conflict warnings", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const store = createShortcutStore();
  const first = document.createElement("div");
  const second = document.createElement("div");

  register(store, {
    command: "run",
    keys: "K",
    scope: [first, second],
  });
  register(store, {
    command: "run",
    scope: [second, first, first],
  });

  expect(consoleWarn).not.toHaveBeenCalled();
});

test("does not reparse invalid declarations during dispatch", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const store = createShortcutStore();

  register(store, {
    command: "invalid",
    keys: "Control+NotAKey",
    onTrigger: vi.fn(),
  });
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  store.setKeys("invalid", "Alt+StillNotAKey");
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  dispatchKey(document.body, "x");
  dispatchKey(document.body, "k", { ctrlKey: true });
  store.getKeys("invalid");

  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("looks up matching keys before resolving command actions", () => {
  const store = createShortcutStore();
  const inspectNonmatchingElement = vi.fn(() => null);
  const matchingHandler = vi.fn();

  for (let index = 0; index < 100; index += 1) {
    register(store, {
      command: `nonmatching-${index}`,
      keys: "Control+J",
      unstable_getElement: inspectNonmatchingElement,
    });
  }
  register(store, {
    command: "matching",
    keys: "Control+K",
    onTrigger: matchingHandler,
  });

  dispatchKey(document.body, "k", { ctrlKey: true });

  expect(matchingHandler).toHaveBeenCalledOnce();
  expect(inspectNonmatchingElement).not.toHaveBeenCalled();
});

test("updates the key lookup after platform, remap, and removal changes", async () => {
  const store = createShortcutStore({ platform: "apple" });
  const handler = vi.fn();
  const remove = register(store, {
    command: "run",
    keys: "apple:Meta+K pc:Control+K",
    onTrigger: handler,
  });

  dispatchKey(document.body, "k", { metaKey: true });
  expect(handler).toHaveBeenCalledTimes(1);

  store.setState("platform", "windows");
  await nextTask();
  dispatchKey(document.body, "k", { metaKey: true });
  dispatchKey(document.body, "k", { ctrlKey: true });
  expect(handler).toHaveBeenCalledTimes(2);

  store.setKeys("run", "Alt+K");
  await nextTask();
  dispatchKey(document.body, "k", { ctrlKey: true });
  dispatchKey(document.body, "k", { altKey: true });
  expect(handler).toHaveBeenCalledTimes(3);

  store.setKeys("run", undefined);
  await nextTask();
  dispatchKey(document.body, "k", { ctrlKey: true });
  expect(handler).toHaveBeenCalledTimes(4);

  store.setState("keys", { run: "Shift+K" });
  await nextTask();
  dispatchKey(document.body, "k", { ctrlKey: true });
  dispatchKey(document.body, "k", { shiftKey: true });
  expect(handler).toHaveBeenCalledTimes(5);

  store.setState("keys", {});
  await nextTask();
  dispatchKey(document.body, "k", { ctrlKey: true });
  expect(handler).toHaveBeenCalledTimes(6);

  remove();
  await nextTask();
  dispatchKey(document.body, "k", { ctrlKey: true });
  expect(handler).toHaveBeenCalledTimes(6);
});

test("keeps same-name sibling groups independent", () => {
  const root = createShortcutStore();
  const first = createShortcutStore({ unstable_parent: root });
  const second = createShortcutStore({ unstable_parent: root });
  const calls: string[] = [];

  register(first, {
    command: "run",
    keys: "Control+1",
    onTrigger: () => calls.push("first"),
  });
  register(second, {
    command: "run",
    keys: "Control+2",
    onTrigger: () => calls.push("second"),
  });

  expect(first.getKeys("run")).toEqual(["Control+1"]);
  expect(second.getKeys("run")).toEqual(["Control+2"]);

  dispatchKey(document.body, "1", { ctrlKey: true });
  dispatchKey(document.body, "2", { ctrlKey: true });

  expect(calls).toEqual(["first", "second"]);
});

test("remaps, unbinds, and restores a named command", () => {
  const store = createShortcutStore({ platform: "windows" });
  const events: ShortcutEvent[] = [];
  register(store, {
    command: "save",
    keys: "mod+S",
    onTrigger: (event) => events.push(event),
  });

  expect(store.getKeys("save")).toEqual(["Control+S"]);

  store.setKeys("save", "Alt+S");
  expect(store.getKeys("save")).toEqual(["Alt+S"]);

  store.setKeys("save", null);
  expect(store.getKeys("save")).toEqual([]);
  expect(store.trigger("save")).toBe(true);
  expect(events.at(-1)).toMatchObject({
    source: "programmatic",
    keys: "",
  });

  store.setKeys("save", undefined);
  expect(store.getKeys("save")).toEqual(["Control+S"]);
});

test("an active child remap shadows the inherited parent binding", async () => {
  const parent = createShortcutStore();
  const child = createShortcutStore({ unstable_parent: parent });
  const calls: string[] = [];
  register(parent, {
    command: "save",
    keys: "Control+S",
    onTrigger: () => calls.push("save"),
  });
  child.setKeys("save", "Alt+S");

  dispatchKey(document.body, "s", { ctrlKey: true });
  expect(calls).toEqual([]);

  dispatchKey(document.body, "s", { altKey: true });
  expect(calls).toEqual(["save"]);

  child.setKeys("save", null);
  await nextTask();
  dispatchKey(document.body, "s", { ctrlKey: true });
  expect(calls).toEqual(["save"]);
});

test("nested priority is scope, store depth, then registration order", async () => {
  const parent = createShortcutStore();
  const child = createShortcutStore({ unstable_parent: parent });
  const region = document.createElement("div");
  const target = document.createElement("button");
  region.append(target);
  document.body.append(region);
  const calls: string[] = [];

  register(parent, {
    keys: "K",
    onTrigger: () => calls.push("parent"),
  });
  register(child, {
    keys: "K",
    onTrigger: () => calls.push("child"),
  });
  const removeScoped = register(parent, {
    keys: "K",
    scope: region,
    onTrigger: () => calls.push("scoped"),
  });

  dispatchKey(target, "k");
  expect(calls).toEqual(["scoped"]);

  removeScoped();
  await nextTask();
  dispatchKey(target, "k");
  expect(calls).toEqual(["scoped", "child"]);

  child.setEnabled(false);
  expect(child.getState().enabled).toBe(false);
  await nextTask();
  dispatchKey(target, "k");
  expect(calls).toEqual(["scoped", "child", "parent"]);
});

test("declining a command falls through without preventing by default", () => {
  const first = createShortcutStore();
  const second = createShortcutStore();
  const calls: string[] = [];
  register(first, {
    keys: "Control+K",
    onTrigger: () => calls.push("first"),
  });
  register(second, {
    keys: "Control+K",
    onTrigger: () => {
      calls.push("second");
      return false;
    },
  });

  const event = dispatchKey(document.body, "k", { ctrlKey: true });

  expect(calls).toEqual(["second", "first"]);
  expect(event.defaultPrevented).toBe(true);
});

test("trigger ignores focus scope but respects effective enabled", () => {
  const parent = createShortcutStore();
  const child = createShortcutStore({ unstable_parent: parent });
  const region = document.createElement("div");
  const calls: ShortcutEvent[] = [];
  register(child, {
    command: "run",
    keys: "R",
    scope: region,
    onTrigger: (event) => calls.push(event),
  });

  expect(child.trigger("run")).toBe(true);
  expect(calls[0]).toMatchObject({
    source: "programmatic",
    command: "run",
    keys: "R",
    target: null,
    originalEvent: undefined,
  });

  parent.setEnabled(false);
  expect(child.getState().enabled).toBe(false);
  expect(child.trigger("run")).toBe(false);
});

test("emits the discriminated event union for every source", async () => {
  const store = createShortcutStore();
  const id = {};
  const button = document.createElement("button");
  document.body.append(button);
  const events: ShortcutEvent[] = [];
  register(store, {
    command: "open",
    keys: "Control+O Alt+O",
    onTrigger: (event) => events.push(event),
    unstable_id: id,
    unstable_getElement: () => button,
  });
  button.addEventListener("click", (event) => {
    store.unstable_triggerCommand(id, event);
  });

  const keyboardEvent = dispatchKey(button, "o", { ctrlKey: true });
  await nextTask();
  button.click();
  store.trigger("open");

  expect(events).toHaveLength(3);
  expect(events[0]).toEqual({
    source: "keyboard",
    command: "open",
    keys: "Control+O",
    target: button,
    originalEvent: keyboardEvent,
  });
  expect(events[1]).toMatchObject({
    source: "click",
    command: "open",
    keys: "Control+O",
    target: button,
  });
  expect(events[1]?.originalEvent).toBeInstanceOf(MouseEvent);
  expect(events[2]).toEqual({
    source: "programmatic",
    command: "open",
    keys: "Control+O",
    target: null,
    originalEvent: undefined,
  });
});

test("bridges an unnamed rendered command click", () => {
  const store = createShortcutStore();
  const id = {};
  const button = document.createElement("button");
  document.body.append(button);
  const events: ShortcutEvent[] = [];
  register(store, {
    keys: "Control+K Alt+K",
    onTrigger: (event) => events.push(event),
    unstable_id: id,
    unstable_getElement: () => button,
  });
  button.addEventListener("click", (event) => {
    store.unstable_triggerCommand(id, event);
  });

  button.click();

  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    source: "click",
    keys: "Control+K",
    target: button,
  });
  expect(events[0]?.command).toBeUndefined();
});

test("synthesizes a current-realm modifierless click and guards bridging", () => {
  const store = createShortcutStore();
  const id = {};
  const button = document.createElement("button");
  document.body.append(button);
  const clicks: MouseEvent[] = [];
  const synthetic: boolean[] = [];
  button.addEventListener("click", (event) => {
    clicks.push(event);
    synthetic.push(store.unstable_isSyntheticClick(event));
    store.unstable_triggerCommand(id, event);
  });
  register(store, {
    command: "press",
    keys: "Control+P",
    unstable_id: id,
    unstable_getElement: () => button,
  });

  dispatchKey(document.body, "p", { ctrlKey: true, shiftKey: false });

  expect(clicks).toHaveLength(1);
  expect(clicks[0]).toBeInstanceOf(MouseEvent);
  expect(clicks[0]).toMatchObject({
    bubbles: true,
    cancelable: true,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
  });
  expect(synthetic).toEqual([true]);
});

test("filters disabled fieldset and inert reference elements", async () => {
  const store = createShortcutStore();
  const fieldset = document.createElement("fieldset");
  fieldset.disabled = true;
  const disabledButton = document.createElement("button");
  fieldset.append(disabledButton);
  const inert = document.createElement("div");
  inert.setAttribute("inert", "");
  const inertButton = document.createElement("button");
  inert.append(inertButton);
  document.body.append(fieldset, inert);
  const calls: string[] = [];
  disabledButton.addEventListener("click", () => calls.push("disabled"));
  inertButton.addEventListener("click", () => calls.push("inert"));

  register(store, {
    keys: "D",
    unstable_getElement: () => disabledButton,
  });
  register(store, {
    keys: "I",
    unstable_getElement: () => inertButton,
  });

  dispatchKey(document.body, "d");
  dispatchKey(document.body, "i");
  expect(calls).toEqual([]);

  fieldset.disabled = false;
  inert.removeAttribute("inert");
  await nextTask();
  dispatchKey(document.body, "d");
  dispatchKey(document.body, "i");
  expect(calls).toEqual(["disabled", "inert"]);
});

test("filters a reference inside an inert shadow host", async () => {
  const store = createShortcutStore();
  const inert = document.createElement("div");
  inert.setAttribute("inert", "");
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const button = document.createElement("button");
  shadow.append(button);
  inert.append(host);
  document.body.append(inert);
  const handler = vi.fn();
  button.addEventListener("click", handler);

  register(store, {
    keys: "K",
    unstable_getElement: () => button,
  });

  dispatchKey(document.body, "k");
  expect(handler).not.toHaveBeenCalled();

  inert.removeAttribute("inert");
  await nextTask();
  dispatchKey(document.body, "k");
  expect(handler).toHaveBeenCalledOnce();
});

test("guards text and number inputs and allows explicit overrides", async () => {
  const store = createShortcutStore({ platform: "apple" });
  const text = document.createElement("input");
  const number = document.createElement("input");
  number.type = "number";
  document.body.append(text, number);
  const calls: string[] = [];

  register(store, { keys: "K", onTrigger: () => calls.push("plain") });
  register(store, {
    keys: "Alt+K",
    onTrigger: () => calls.push("option"),
  });
  register(store, {
    keys: "Control+K",
    onTrigger: () => calls.push("control"),
  });
  register(store, {
    keys: "J",
    enabledInTextbox: true,
    onTrigger: () => calls.push("override"),
  });

  dispatchKey(text, "k");
  dispatchKey(text, "k", { altKey: true });
  dispatchKey(text, "k", { ctrlKey: true });
  dispatchKey(text, "j");
  dispatchKey(number, "k");
  await nextTask();
  dispatchKey(number, "j");

  expect(calls).toEqual(["control", "override", "override"]);
});

test.each(["email", "number", "password", "search", "tel", "text", "url"])(
  "guards %s inputs from bare printable shortcuts",
  (type) => {
    const store = createShortcutStore();
    const input = document.createElement("input");
    input.type = type;
    document.body.append(input);
    const handler = vi.fn();
    register(store, { keys: "K", onTrigger: handler });

    const event = dispatchKey(input, "k");

    expect(handler).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  },
);

test("deduplicates inherited actions after textbox eligibility", () => {
  const root = createShortcutStore();
  const allowed = createShortcutStore({ unstable_parent: root });
  const blocked = createShortcutStore({ unstable_parent: root });
  const input = document.createElement("input");
  document.body.append(input);
  const handler = vi.fn();

  register(root, {
    command: "run",
    keys: "K",
    onTrigger: handler,
  });
  register(allowed, {
    command: "run",
    enabledInTextbox: true,
  });
  register(blocked, {
    command: "run",
    enabledInTextbox: false,
  });

  dispatchKey(input, "k");

  expect(handler).toHaveBeenCalledOnce();
});

test("uses the physical textbox origin with aria-activedescendant", () => {
  const store = createShortcutStore();
  const input = document.createElement("input");
  const option = document.createElement("div");
  option.id = "active-option";
  input.setAttribute("aria-activedescendant", option.id);
  document.body.append(input, option);
  const handler = vi.fn();
  register(store, {
    keys: "K",
    scope: option,
    onTrigger: handler,
  });

  const event = dispatchKey(input, "k");

  expect(handler).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

test("uses the active child binding platform for textbox policy", () => {
  const parent = createShortcutStore({ platform: "apple" });
  const child = createShortcutStore({
    platform: "windows",
    unstable_parent: parent,
  });
  const input = document.createElement("input");
  document.body.append(input);
  const handler = vi.fn();
  register(parent, {
    command: "run",
    keys: "Control+K",
    onTrigger: handler,
  });
  child.setKeys("run", "Alt+K");

  const event = dispatchKey(input, "k", { altKey: true });

  expect(handler).toHaveBeenCalledOnce();
  expect(event.defaultPrevented).toBe(true);
});

test("ignores recording regions and guarded keyboard events", () => {
  const store = createShortcutStore();
  const recording = document.createElement("div");
  recording.setAttribute("data-shortcut-recording", "");
  const target = document.createElement("button");
  recording.append(target);
  document.body.append(recording);
  const handler = vi.fn();
  register(store, { keys: "K", onTrigger: handler });

  dispatchKey(target, "k");
  dispatchKey(document.body, "Dead");
  dispatchKey(document.body, "Unidentified");
  dispatchKey(document.body, "Shift", { shiftKey: true });
  dispatchKey(document.body, "k", { isComposing: true });
  dispatchKey(document.body, "€", {
    ctrlKey: true,
    altKey: true,
  });

  expect(handler).not.toHaveBeenCalled();
});

test("matches scope arrays and open-shadow composed origins", async () => {
  const store = createShortcutStore();
  const first = document.createElement("div");
  const second = document.createElement("div");
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const target = document.createElement("button");
  shadow.append(target);
  second.append(host);
  document.body.append(first, second);
  const calls: Element[] = [];
  register(store, {
    keys: "K",
    scope: [{ current: first }, { current: second }],
    onTrigger: (event) => {
      if (event.target) calls.push(event.target);
    },
  });

  dispatchKey(target, "k", { composed: true });
  expect(calls).toEqual([target]);

  await nextTask();
  dispatchKey(document.body, "k");
  expect(calls).toEqual([target]);
});

test("treats elements with a current property as scope elements", () => {
  const store = createShortcutStore();
  const region = Object.assign(document.createElement("div"), {
    current: null as Element | null,
  });
  const target = document.createElement("button");
  region.append(target);
  document.body.append(region);
  const handler = vi.fn();
  register(store, { keys: "K", scope: region, onTrigger: handler });

  dispatchKey(target, "k");

  expect(handler).toHaveBeenCalledOnce();
});

test("ranks inner logical scopes above outer raw refs", () => {
  const store = createShortcutStore();
  const scope = {};
  const outer = document.createElement("div");
  const inner = document.createElement("div");
  const target = document.createElement("button");
  inner.append(target);
  outer.append(inner);
  document.body.append(outer);
  const calls: string[] = [];
  registerScope(store, {
    unstable_id: scope,
    unstable_getElement: () => inner,
  });
  register(store, {
    keys: "K",
    unstable_scope: scope,
    onTrigger: () => calls.push("inner"),
  });
  register(store, {
    keys: "K",
    scope: outer,
    onTrigger: () => calls.push("outer"),
  });

  dispatchKey(target, "k");

  expect(calls).toEqual(["inner"]);
});

test("ranks portalled logical descendants by their matched region", () => {
  const store = createShortcutStore();
  const parentScope = {};
  const childScope = {};
  const logicalParent = document.createElement("div");
  const portalOuter = document.createElement("div");
  const portalInner = document.createElement("div");
  const target = document.createElement("button");
  portalInner.append(target);
  portalOuter.append(portalInner);
  document.body.append(logicalParent, portalOuter);
  const calls: string[] = [];
  registerScope(store, {
    unstable_id: parentScope,
    unstable_getElement: () => logicalParent,
  });
  registerScope(store, {
    unstable_id: childScope,
    unstable_parent: parentScope,
    unstable_getElement: () => portalInner,
  });
  register(store, {
    keys: "K",
    unstable_scope: parentScope,
    onTrigger: () => calls.push("logical"),
  });
  register(store, {
    keys: "K",
    scope: portalOuter,
    onTrigger: () => calls.push("raw"),
  });

  dispatchKey(target, "k");

  expect(calls).toEqual(["logical"]);
});

test("keeps declared logical scope priority for a shared matched region", () => {
  const store = createShortcutStore();
  const parentScope = {};
  const childScope = {};
  const parent = document.createElement("div");
  const child = document.createElement("div");
  const target = document.createElement("button");
  child.append(target);
  parent.append(child);
  document.body.append(parent);
  const calls: string[] = [];
  registerScope(store, {
    unstable_id: parentScope,
    unstable_getElement: () => parent,
  });
  registerScope(store, {
    unstable_id: childScope,
    unstable_parent: parentScope,
    unstable_getElement: () => child,
  });
  register(store, {
    keys: "K",
    unstable_scope: childScope,
    onTrigger: () => calls.push("child"),
  });
  register(store, {
    keys: "K",
    unstable_scope: parentScope,
    onTrigger: () => calls.push("parent"),
  });

  dispatchKey(target, "k");

  expect(calls).toEqual(["child"]);
});

test("keeps unresolved scope refs out of scope", async () => {
  const store = createShortcutStore();
  const region = document.createElement("div");
  const target = document.createElement("button");
  region.append(target);
  document.body.append(region);
  const ref: { current: Element | null } = { current: null };
  const handler = vi.fn();
  register(store, {
    keys: "K",
    scope: ref,
    onTrigger: handler,
  });

  dispatchKey(target, "k");
  expect(handler).not.toHaveBeenCalled();

  ref.current = region;
  await nextTask();
  dispatchKey(target, "k");
  expect(handler).toHaveBeenCalledOnce();
});

test("resolves aria-activedescendant in the origin shadow root", () => {
  const store = createShortcutStore();
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const controller = document.createElement("div");
  const active = document.createElement("button");
  active.id = "shadow-active";
  controller.setAttribute("aria-activedescendant", active.id);
  shadow.append(controller, active);
  document.body.append(host);
  const targets: Array<Element | null> = [];
  register(store, {
    keys: "K",
    scope: active,
    onTrigger: (event) => targets.push(event.target),
  });

  dispatchKey(controller, "k", { composed: true });

  expect(targets).toEqual([active]);
});

test("preserves deep open-shadow focus across focusout microtasks", async () => {
  const store = createShortcutStore();
  const id = {};
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const first = document.createElement("button");
  const second = document.createElement("button");
  shadow.append(first, second);
  document.body.append(host);
  register(store, {
    keys: "K",
    scope: second,
    unstable_id: id,
    onTrigger: vi.fn(),
  });

  first.focus();
  expect(store.unstable_getCommandState(id)?.inScope).toBe(false);

  second.focus();
  await Promise.resolve();

  expect(shadow.activeElement).toBe(second);
  expect(store.unstable_getCommandState(id)?.inScope).toBe(true);
});

test("observes aria-activedescendant inside the focused shadow root", async () => {
  const store = createShortcutStore();
  const id = {};
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const controller = document.createElement("input");
  const first = document.createElement("div");
  const second = document.createElement("div");
  first.id = "shadow-first";
  second.id = "shadow-second";
  controller.setAttribute("aria-activedescendant", first.id);
  shadow.append(controller, first, second);
  document.body.append(host);
  register(store, {
    keys: "K",
    scope: second,
    unstable_id: id,
    onTrigger: vi.fn(),
  });
  const listener = vi.fn();
  const unsubscribe = store.unstable_subscribeRegistry(listener);
  cleanups.push(unsubscribe);

  controller.focus();
  expect(store.unstable_getCommandState(id)?.inScope).toBe(false);

  controller.setAttribute("aria-activedescendant", second.id);

  await expect
    .poll(() => store.unstable_getCommandState(id)?.inScope)
    .toBe(true);
  expect(listener).toHaveBeenCalled();
});

test("tracks logical portal descendants and active React scopes", async () => {
  const store = createShortcutStore();
  const parentScope = {};
  const childScope = {};
  const parentRegion = document.createElement("div");
  const portalRegion = document.createElement("div");
  const portalTarget = document.createElement("button");
  const unrelated = document.createElement("button");
  portalRegion.append(portalTarget);
  document.body.append(parentRegion, portalRegion, unrelated);
  registerScope(store, {
    unstable_id: parentScope,
    unstable_getElement: () => parentRegion,
  });
  registerScope(store, {
    unstable_id: childScope,
    unstable_parent: parentScope,
    unstable_getElement: () => portalRegion,
  });
  const handler = vi.fn();
  register(store, {
    keys: "K",
    unstable_scope: parentScope,
    onTrigger: handler,
  });

  dispatchKey(portalTarget, "k");
  expect(handler).toHaveBeenCalledTimes(1);

  store.unstable_setActiveScope(childScope, document);
  await nextTask();
  dispatchKey(unrelated, "k");
  expect(handler).toHaveBeenCalledTimes(2);
  expect(store.unstable_isScopeActive(parentScope, unrelated)).toBe(true);

  store.unstable_clearActiveScope(childScope, document);
  await nextTask();
  dispatchKey(unrelated, "k");
  expect(handler).toHaveBeenCalledTimes(2);
});

test("does not treat body focus as a non-global scope", () => {
  const store = createShortcutStore();
  const scoped = vi.fn();
  const global = vi.fn();
  register(store, { keys: "K", scope: document.body, onTrigger: scoped });
  register(store, { keys: "K", scope: null, onTrigger: global });

  dispatchKey(document.body, "k");

  expect(scoped).not.toHaveBeenCalled();
  expect(global).toHaveBeenCalledOnce();
});

test("uses one capture dispatcher across live stores", () => {
  const addEventListener = vi.spyOn(document, "addEventListener");
  const first = createShortcutStore();
  const second = createShortcutStore();
  const calls: string[] = [];
  register(first, { keys: "K", onTrigger: () => calls.push("first") });
  register(second, { keys: "K", onTrigger: () => calls.push("second") });

  const keydownListeners = addEventListener.mock.calls.filter(
    ([type]) => type === "keydown",
  );
  expect(keydownListeners).toHaveLength(1);

  dispatchKey(document.body, "k");
  expect(calls).toEqual(["second"]);
});

test("deduplicates event identity and same-task signatures", async () => {
  const store = createShortcutStore();
  const handler = vi.fn();
  register(store, { keys: "K", onTrigger: handler });
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "k",
  });

  document.body.dispatchEvent(event);
  document.body.dispatchEvent(event);
  dispatchKey(document.body, "k");
  expect(handler).toHaveBeenCalledTimes(1);

  await nextTask();
  dispatchKey(document.body, "k");
  expect(handler).toHaveBeenCalledTimes(2);
});

test("dispatches in a second document only while explicitly attached", () => {
  const store = createShortcutStore();
  const secondDocument = document.implementation.createHTMLDocument("frame");
  const target = secondDocument.createElement("button");
  secondDocument.body.append(target);
  const handler = vi.fn();
  register(store, { keys: "K", onTrigger: handler });

  dispatchKey(target, "k");
  expect(handler).not.toHaveBeenCalled();

  const detach = attach(store, secondDocument);
  dispatchKey(target, "k");
  expect(handler).toHaveBeenCalledOnce();

  detach();
  detach();
  dispatchKey(target, "k");
  expect(handler).toHaveBeenCalledOnce();
});

test("preserves an active logical scope until its document is attached", () => {
  const store = createShortcutStore();
  const secondDocument = document.implementation.createHTMLDocument("frame");
  const target = secondDocument.createElement("button");
  secondDocument.body.append(target);
  const scope = {};
  const handler = vi.fn();
  const unregisterScope = store.registerScope({ unstable_id: scope });
  cleanups.push(unregisterScope);
  register(store, {
    keys: "K",
    onTrigger: handler,
    unstable_scope: scope,
  });

  store.unstable_setActiveScope(scope, secondDocument);
  const detach = attach(store, secondDocument);
  dispatchKey(target, "k");

  expect(handler).toHaveBeenCalledOnce();
  detach();
});

test("unregister cleanup is identity-safe and idempotent", () => {
  const store = createShortcutStore();
  const calls: string[] = [];
  const onTrigger = () => calls.push("run");
  const removeFirst = register(store, {
    command: "run",
    keys: "K",
    onTrigger,
  });
  register(store, {
    command: "run",
    onTrigger,
  });

  removeFirst();
  removeFirst();

  expect(store.getKeys("run")).toEqual([]);
  expect(store.trigger("run")).toBe(true);
  expect(calls).toEqual(["run"]);
});

test("defers nested runtime activation until initialization", async () => {
  const parent = createShortcutStore();
  const child = createShortcutStore({
    unstable_parent: parent,
    unstable_deferActivation: true,
  });
  const calls: string[] = [];
  register(parent, {
    command: "save",
    keys: "Control+S",
    onTrigger: () => calls.push("parent"),
  });
  child.setKeys("save", "Alt+S");

  dispatchKey(document.body, "s", { ctrlKey: true });
  expect(calls).toEqual(["parent"]);

  await nextTask();
  const dispose = init(child);
  cleanups.push(dispose);
  dispatchKey(document.body, "s", { ctrlKey: true });
  dispatchKey(document.body, "s", { altKey: true });
  expect(calls).toEqual(["parent", "parent"]);

  dispose();
  await nextTask();
  dispatchKey(document.body, "s", { ctrlKey: true });
  expect(calls).toEqual(["parent", "parent", "parent"]);
});

test("removes initialized child runtimes when their owner unmounts", async () => {
  const parent = createShortcutStore();
  const child = createShortcutStore({ unstable_parent: parent });
  const calls: string[] = [];
  register(parent, {
    command: "save",
    keys: "Control+S",
    onTrigger: () => calls.push("parent"),
  });
  child.setKeys("save", "Alt+S");
  const dispose = init(child);

  dispatchKey(document.body, "s", { altKey: true });
  expect(calls).toEqual(["parent"]);

  dispose();
  await nextTask();
  dispatchKey(document.body, "s", { altKey: true });
  expect(calls).toEqual(["parent"]);
  dispatchKey(document.body, "s", { ctrlKey: true });
  expect(calls).toEqual(["parent", "parent"]);
});
