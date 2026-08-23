import { init, sync } from "@ariakit/store";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { NotificationStoreItem } from "./notification-store.ts";
import { createNotificationStore } from "./notification-store.ts";

function createItem(
  id: string,
  timeout?: number | null,
): NotificationStoreItem {
  return {
    id,
    message: `Message ${id}`,
    createdAt: -1_000,
    ...(timeout !== undefined && { timeout }),
  };
}

function getRegion(priority: "polite" | "assertive", ownerDocument = document) {
  return ownerDocument.querySelector<HTMLElement>(
    `[role="log"][aria-live="${priority}"]`,
  );
}

function createFrame() {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  const ownerDocument = iframe.contentDocument;
  const ownerWindow = iframe.contentWindow;
  if (!ownerDocument) throw new Error("Missing iframe document");
  if (!ownerWindow) throw new Error("Missing iframe window");
  return { iframe, ownerDocument, ownerWindow };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  for (const region of document.querySelectorAll(
    '[data-notifications] [role="log"]',
  )) {
    region.replaceChildren();
  }
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("does not mutate the DOM when the store is created", () => {
  expect(document.querySelector("[data-notifications]")).toBeNull();

  createNotificationStore();

  expect(document.querySelector("[data-notifications]")).toBeNull();
});

test("uses the ambient document on the first imperative push", () => {
  const store = createNotificationStore();

  store.push("First announcement");

  expect(getRegion("polite")).toHaveTextContent("First announcement");
});

test("queues an announcement until the bound document has a body", () => {
  const ownerDocument = document.implementation.createHTMLDocument();
  ownerDocument.body.remove();
  const store = createNotificationStore();
  const unbindDocument = store.unstable_bindDocument(ownerDocument);

  store.push("Queued announcement");
  expect(ownerDocument.querySelector("[data-notifications]")).toBeNull();

  const body = ownerDocument.createElement("body");
  ownerDocument.documentElement.appendChild(body);
  ownerDocument.dispatchEvent(new Event("DOMContentLoaded"));

  expect(getRegion("polite", ownerDocument)?.textContent).toBe(
    "Queued announcement",
  );
  unbindDocument();
});

test("observes body insertion in a viewless bound document", async () => {
  const ownerDocument = document.implementation.createHTMLDocument();
  ownerDocument.body.remove();
  const store = createNotificationStore();
  const unbindDocument = store.unstable_bindDocument(ownerDocument);

  store.push("Observed announcement");
  const body = ownerDocument.createElement("body");
  ownerDocument.documentElement.appendChild(body);

  await vi.waitFor(() => {
    expect(getRegion("polite", ownerDocument)?.textContent).toBe(
      "Observed announcement",
    );
  });
  unbindDocument();
});

test("cancels queued announcements when their document is released", () => {
  const ownerDocument = document.implementation.createHTMLDocument();
  ownerDocument.body.remove();
  const store = createNotificationStore();
  const unbindDocument = store.unstable_bindDocument(ownerDocument);

  store.push("Stale announcement");
  unbindDocument();

  const body = ownerDocument.createElement("body");
  ownerDocument.documentElement.appendChild(body);
  ownerDocument.dispatchEvent(new Event("DOMContentLoaded"));

  expect(ownerDocument.querySelector("[data-notifications]")).toBeNull();
});

test("flushes queued text before a synchronous keyed replacement", () => {
  const ownerDocument = document.implementation.createHTMLDocument();
  ownerDocument.body.remove();
  const store = createNotificationStore();
  const unbindDocument = store.unstable_bindDocument(ownerDocument);
  const id = store.push({ id: "upload", message: "Upload started" });

  const body = ownerDocument.createElement("body");
  ownerDocument.documentElement.appendChild(body);
  store.update(id, { message: "Upload complete" });
  ownerDocument.dispatchEvent(new Event("DOMContentLoaded"));

  expect(getRegion("polite", ownerDocument)?.textContent).toBe(
    "Upload complete",
  );
  unbindDocument();
});

test("uses a bound iframe document for DOM lifecycle effects", () => {
  const { iframe, ownerDocument, ownerWindow } = createFrame();
  vi.spyOn(ownerDocument, "hasFocus").mockReturnValue(true);
  const hidden = vi
    .spyOn(ownerDocument, "hidden", "get")
    .mockReturnValue(false);
  const setTimeout = vi.spyOn(ownerWindow, "setTimeout");
  const store = createNotificationStore({ timeout: 100 });
  const unbindDocument = store.unstable_bindDocument(ownerDocument);
  const stop = init(store);

  try {
    const id = store.push("Frame announcement");
    store.unstable_renderItem(id);

    expect(getRegion("polite", ownerDocument)?.textContent).toBe(
      "Frame announcement",
    );
    expect(getRegion("polite")).toBeNull();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 350);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);

    window.dispatchEvent(new Event("blur"));
    expect(store.getState().paused).toBe(false);
    ownerWindow.dispatchEvent(new Event("blur"));
    expect(store.getState().paused).toBe(true);
    ownerWindow.dispatchEvent(new Event("focus"));
    expect(store.getState().paused).toBe(false);

    hidden.mockReturnValue(true);
    ownerDocument.dispatchEvent(new Event("visibilitychange"));
    expect(store.getState().paused).toBe(true);
    hidden.mockReturnValue(false);
    ownerDocument.dispatchEvent(new Event("visibilitychange"));
    expect(store.getState().paused).toBe(false);
  } finally {
    store.clear();
    stop();
    unbindDocument();
    iframe.remove();
  }
});

test("preserves deadline time when the bound document changes", () => {
  vi.setSystemTime(1_000);
  const firstFrame = createFrame();
  const secondFrame = createFrame();
  vi.spyOn(firstFrame.ownerDocument, "hasFocus").mockReturnValue(true);
  vi.spyOn(secondFrame.ownerDocument, "hasFocus").mockReturnValue(true);
  const secondSetTimeout = vi.spyOn(secondFrame.ownerWindow, "setTimeout");
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  const unbindFirst = store.unstable_bindDocument(firstFrame.ownerDocument);
  const stop = init(store);
  store.unstable_renderItem("n1");

  try {
    vi.advanceTimersByTime(40);
    const unbindSecond = store.unstable_bindDocument(secondFrame.ownerDocument);

    expect(secondSetTimeout).toHaveBeenCalledWith(expect.any(Function), 60);
    expect(store.item("n1")).not.toBeNull();

    firstFrame.ownerWindow.dispatchEvent(new Event("blur"));
    expect(store.getState().paused).toBe(false);
    secondFrame.ownerWindow.dispatchEvent(new Event("blur"));
    expect(store.getState().paused).toBe(true);
    secondFrame.ownerWindow.dispatchEvent(new Event("focus"));
    expect(store.getState().paused).toBe(false);

    unbindSecond();
    unbindSecond();
    store.announce("Back in the first frame");
    expect(getRegion("polite", firstFrame.ownerDocument)).toHaveTextContent(
      "Back in the first frame",
    );
  } finally {
    store.clear();
    stop();
    unbindFirst();
    firstFrame.iframe.remove();
    secondFrame.iframe.remove();
  }
});

test("stays paused when moving between paused documents", () => {
  const firstFrame = createFrame();
  const secondFrame = createFrame();
  vi.spyOn(firstFrame.ownerDocument, "hidden", "get").mockReturnValue(true);
  vi.spyOn(secondFrame.ownerDocument, "hidden", "get").mockReturnValue(true);
  vi.spyOn(firstFrame.ownerDocument, "hasFocus").mockReturnValue(false);
  vi.spyOn(secondFrame.ownerDocument, "hasFocus").mockReturnValue(false);
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  const unbindFirst = store.unstable_bindDocument(firstFrame.ownerDocument);
  const stop = init(store);
  const pausedChanges: boolean[] = [];
  const stopSync = sync(store, ["paused"], ({ paused }) => {
    pausedChanges.push(paused);
  });

  try {
    store.unstable_renderItem("n1");
    expect(store.getState().paused).toBe(true);
    pausedChanges.length = 0;

    const unbindSecond = store.unstable_bindDocument(secondFrame.ownerDocument);

    expect(store.getState().paused).toBe(true);
    expect(pausedChanges).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);

    unbindSecond();
    expect(store.getState().paused).toBe(true);
    expect(pausedChanges).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    stopSync();
    store.clear();
    stop();
    unbindFirst();
    firstFrame.iframe.remove();
    secondFrame.iframe.remove();
  }
});

test("mints collision-free ids and replaces an authored id in place", () => {
  vi.setSystemTime(1_000);
  const firstItem = createItem("n1");
  const lastItem = createItem("last");
  const store = createNotificationStore({
    defaultItems: [firstItem, lastItem],
  });

  expect(store.push("Generated")).toBe("n2");
  expect(store.push({ id: "n1", message: "Replaced" })).toBe("n1");

  expect(store.getState().items.map((item) => item.id)).toEqual([
    "n1",
    "last",
    "n2",
  ]);
  expect(store.item("n1")).toMatchObject({
    id: "n1",
    message: "Replaced",
    createdAt: 1_000,
  });
  expect(store.item("n1")).not.toBe(firstItem);
});

test("supports an empty string authored id", () => {
  const store = createNotificationStore();

  expect(store.push({ id: "", message: "Empty id" })).toBe("");
  expect(store.item("")).toMatchObject({ id: "", message: "Empty id" });

  store.update("", { message: "Updated" }, { announce: false });
  expect(store.item("")?.message).toBe("Updated");

  store.remove("");
  expect(store.item("")).toBeNull();
});

test("announces record text and only re-announces meaningful updates", () => {
  const store = createNotificationStore<{ progress?: number }>();
  const id = store.push({
    heading: "Uploading",
    message: "1 of 3 files.",
    data: { progress: 1 },
  });
  const polite = getRegion("polite");
  const firstNodes = Array.from(polite?.childNodes || []);

  expect(firstNodes).toHaveLength(2);
  expect(polite).toHaveTextContent("Uploading1 of 3 files.");

  store.update(id, { data: { progress: 2 } });
  expect(Array.from(polite?.childNodes || [])).toEqual(firstNodes);

  store.update(id, { message: "2 of 3 files." });
  expect(firstNodes.every((node) => !node.isConnected)).toBe(true);
  expect(polite).toHaveTextContent("Uploading2 of 3 files.");

  store.update(id, { message: "3 of 3 files." }, { announce: false });
  expect(polite).not.toHaveTextContent("3 of 3 files.");

  store.update(id, {}, { announce: true });
  expect(polite).toHaveTextContent("Uploading3 of 3 files.");

  store.announce({ message: "Disk is full.", priority: "assertive" });
  expect(getRegion("assertive")).toHaveTextContent("Disk is full.");
});

test("does not start deadlines for never-rendered records", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 10)],
  });

  store.update("n1", { timeout: 1 }, { announce: false });
  vi.advanceTimersByTime(100);
  expect(store.item("n1")).not.toBeNull();

  store.push({ id: "n1", message: "Replaced", timeout: 1 });
  vi.advanceTimersByTime(100);
  expect(store.item("n1")).not.toBeNull();
  expect(store.getState().unstable_renderedIds).toEqual([]);
});

test("starts the full timeout on first render and keeps it off-screen", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  const unrender = store.unstable_renderItem("n1");

  vi.advanceTimersByTime(40);
  unrender();
  expect(store.getState().unstable_renderedIds).toEqual([]);

  vi.advanceTimersByTime(59);
  expect(store.item("n1")).not.toBeNull();
  vi.advanceTimersByTime(1);
  expect(store.item("n1")).toBeNull();
});

test("resets an off-screen deadline when the same id is pushed", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  const unrender = store.unstable_renderItem("n1");

  vi.advanceTimersByTime(25);
  unrender();
  store.push({ id: "n1", message: "Replacement", timeout: 100 });

  // The original deadline would have fired after another 75 ms.
  vi.advanceTimersByTime(99);
  expect(store.item("n1")).not.toBeNull();
  vi.advanceTimersByTime(1);
  expect(store.item("n1")).toBeNull();
});

test("resets or cancels an off-screen deadline when timeout changes", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100), createItem("n2", 100)],
  });
  const unrenderFirst = store.unstable_renderItem("n1");
  const unrenderSecond = store.unstable_renderItem("n2");

  vi.advanceTimersByTime(25);
  unrenderFirst();
  unrenderSecond();
  store.update("n1", { timeout: 200 }, { announce: false });
  store.update("n2", { timeout: null }, { announce: false });

  vi.advanceTimersByTime(199);
  expect(store.item("n1")).not.toBeNull();
  expect(store.item("n2")).not.toBeNull();
  vi.advanceTimersByTime(1);
  expect(store.item("n1")).toBeNull();

  vi.advanceTimersByTime(1_000);
  expect(store.item("n2")).not.toBeNull();
});

test("refcounts multiple rendered instances of the same record", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", null)],
  });
  const unrenderFirst = store.unstable_renderItem("n1");
  const unrenderSecond = store.unstable_renderItem("n1");

  expect(store.getState().unstable_renderedIds).toEqual(["n1"]);
  unrenderFirst();
  expect(store.getState().unstable_renderedIds).toEqual(["n1"]);
  unrenderFirst();
  expect(store.getState().unstable_renderedIds).toEqual(["n1"]);
  unrenderSecond();
  expect(store.getState().unstable_renderedIds).toEqual([]);
});

test("resumes a deadline only after every manual pause hold is released", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  store.unstable_renderItem("n1");
  vi.advanceTimersByTime(40);

  const releaseFirst = store.pause();
  const releaseSecond = store.pause();
  expect(store.getState().paused).toBe(true);

  vi.advanceTimersByTime(1_000);
  releaseFirst();
  releaseFirst();
  expect(store.getState().paused).toBe(true);
  vi.advanceTimersByTime(1_000);
  expect(store.item("n1")).not.toBeNull();

  releaseSecond();
  expect(store.getState().paused).toBe(false);
  vi.advanceTimersByTime(59);
  expect(store.item("n1")).not.toBeNull();
  vi.advanceTimersByTime(1);
  expect(store.item("n1")).toBeNull();
});

test("keeps a manual pause across window blur and focus", () => {
  const store = createNotificationStore({
    defaultItems: [createItem("n1", 100)],
  });
  const stop = init(store);

  try {
    store.unstable_renderItem("n1");
    vi.advanceTimersByTime(25);
    expect(vi.getTimerCount()).toBe(1);

    const releaseManual = store.pause();
    window.dispatchEvent(new Event("blur"));
    window.dispatchEvent(new Event("blur"));
    expect(vi.getTimerCount()).toBe(0);

    window.dispatchEvent(new Event("focus"));
    expect(store.getState().paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);

    releaseManual();
    expect(store.getState().paused).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(74);
    expect(store.item("n1")).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(store.item("n1")).toBeNull();
  } finally {
    store.clear();
    stop();
  }
});

test("warns once when an operation targets a missing id", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const store = createNotificationStore();

  store.remove("missing");
  store.update("missing", { message: "Ignored" });
  store.remove("missing");

  expect(consoleWarn).toHaveBeenCalledTimes(1);
  expect(consoleWarn).toHaveBeenCalledWith(
    'Notification item "missing" does not exist.',
  );
});

test("reports every item change through the controlled callback", () => {
  const setItems = vi.fn();
  const store = createNotificationStore({ setItems });

  const id = store.push("Created");
  expect(setItems).toHaveBeenLastCalledWith([
    expect.objectContaining({ id, message: "Created" }),
  ]);

  store.update(id, { message: "Updated" }, { announce: false });
  expect(setItems).toHaveBeenLastCalledWith([
    expect.objectContaining({ id, message: "Updated" }),
  ]);

  store.remove(id);
  expect(setItems).toHaveBeenLastCalledWith([]);
  expect(setItems).toHaveBeenCalledTimes(3);
});
