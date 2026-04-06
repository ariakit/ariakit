import { afterEach, describe, expect, test, vi } from "vitest";
import {
  acquireCloseWatcherBridge,
  isBridgeEvent,
  releaseCloseWatcherBridge,
} from "./close-watcher-bridge.ts";
import type { CloseWatcherInstance } from "./supports-close-watcher.ts";

describe("close watcher bridge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, "CloseWatcher");
  });

  test("uses the owner window to dispatch synthetic Escape events", () => {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;

    if (!iframeWindow || !iframeDocument) {
      document.body.removeChild(iframe);
      return;
    }

    const ownerWindow = iframeWindow as CloseWatcherTestWindow;
    const closeWatchers: Array<CloseWatcherInstance> = [];
    const parentCloseWatcher = vi.fn(() => {
      throw new Error("Parent CloseWatcher should not be used");
    });

    class CloseWatcher extends ownerWindow.EventTarget {
      oncancel = null;
      onclose = null;
      destroy = vi.fn();
      close = vi.fn();
      requestClose = vi.fn();

      constructor() {
        super();
        closeWatchers.push(this);
      }
    }

    Object.defineProperty(globalThis, "CloseWatcher", {
      configurable: true,
      value: parentCloseWatcher,
    });

    Object.defineProperty(ownerWindow, "CloseWatcher", {
      configurable: true,
      value: CloseWatcher,
    });

    const button = iframeDocument.createElement("button");
    iframeDocument.body.appendChild(button);
    button.focus();

    const events: Array<KeyboardEvent> = [];
    button.addEventListener("keydown", (event) => {
      events.push(event);
    });

    acquireCloseWatcherBridge(button);

    const watcher = closeWatchers[0];
    if (!watcher) {
      document.body.removeChild(iframe);
      return;
    }

    watcher.dispatchEvent(new ownerWindow.Event("close"));

    releaseCloseWatcherBridge(button);
    document.body.removeChild(iframe);

    const event = events[0];
    if (!event) {
      throw new Error("Expected bridge keydown event");
    }

    expect(parentCloseWatcher).not.toHaveBeenCalled();
    expect(event).toBeInstanceOf(ownerWindow.KeyboardEvent);
    expect(event.key).toBe("Escape");
    expect(event.code).toBe("Escape");
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(isBridgeEvent(event)).toBe(true);
  });
});

interface CloseWatcherTestWindow extends Window {
  Event: typeof Event;
  EventTarget: typeof EventTarget;
  KeyboardEvent: typeof KeyboardEvent;
}
