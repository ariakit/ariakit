import { expect, test } from "vitest";
import { isBrowser, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import "./shims.ts";

test("applies the browser shims at import, for the whole environment", () => {
  if (isBrowser) return;
  const connected = document.createElement("button");
  document.body.append(connected);
  const disconnected = document.createElement("button");
  try {
    // The getClientRects shim reports a 1x1 rect for connected, visible
    // elements even outside a simulated interaction (`wrapAsync`)...
    expect(connected.getClientRects()[0]).toMatchObject({
      width: 1,
      height: 1,
    });
    // ...and an empty list for elements that aren't visible.
    expect(disconnected.getClientRects()).toHaveLength(0);
  } finally {
    connected.remove();
  }
});

test("keeps the browser shims applied after an interaction settles", async () => {
  if (isBrowser) return;
  const element = document.createElement("button");
  document.body.append(element);
  try {
    await wrapAsync(async () => {});
    // The shims are no longer torn down between interactions, so they're still
    // in place once `wrapAsync` returns.
    expect(element.getClientRects()[0]).toMatchObject({ width: 1, height: 1 });
  } finally {
    element.remove();
  }
});

test("runs animation frame callbacks as a spec-compliant batch", async () => {
  if (isBrowser) return;
  const order: string[] = [];
  const timestamps: number[] = [];
  await new Promise<void>((resolve) => {
    requestAnimationFrame((timestamp) => {
      order.push("a");
      timestamps.push(timestamp);
      // Requested while the frame is running, so it must be deferred to the
      // next frame — after "b", not interleaved before it.
      requestAnimationFrame(() => {
        order.push("c");
        resolve();
      });
    });
    requestAnimationFrame((timestamp) => {
      order.push("b");
      timestamps.push(timestamp);
    });
  });
  // "c" is requested during the frame, so it runs after "b" (deferred to the
  // next frame), which the order asserts. The property unique to batching — and
  // the real point of this test — is that the same-frame callbacks "a" and "b"
  // share one timestamp; unbatched, each would get its own.
  expect(order).toEqual(["a", "b", "c"]);
  expect(timestamps[0]).toBe(timestamps[1]);
});

test("exposes the dispatched event on window.event while listeners run", async () => {
  if (isBrowser) return;
  const button = document.createElement("button");
  document.body.append(button);
  let eventTypeDuringDispatch: string | undefined;
  button.addEventListener("click", () => {
    eventTypeDuringDispatch = (window as { event?: Event }).event?.type;
  });
  try {
    // React 18 reads `window.event` to give updates dispatched from a native
    // listener discrete-event (sync) priority. happy-dom omits the global, so
    // `@ariakit/test`'s dispatch sets it for the synchronous duration of the
    // dispatch to match jsdom and real browsers.
    await dispatch.click(button);
    expect(eventTypeDuringDispatch).toBe("click");
    // It's exposed only while listeners run, then removed (happy-dom has no
    // such property to begin with, so the shim deletes it again).
    expect("event" in window).toBe(false);
  } finally {
    button.remove();
  }
});

test("restores window.event around a nested dispatch", async () => {
  if (isBrowser) return;
  const outer = document.createElement("button");
  const inner = document.createElement("button");
  document.body.append(outer, inner);
  const seen: Array<string | undefined> = [];
  outer.addEventListener("click", () => {
    seen.push((window as { event?: Event }).event?.type);
    // A nested dispatch fires its event synchronously, so `window.event` is the
    // inner event while the inner listener runs, then restored to the outer one.
    void dispatch.mouseDown(inner);
    seen.push((window as { event?: Event }).event?.type);
  });
  inner.addEventListener("mousedown", () => {
    seen.push((window as { event?: Event }).event?.type);
  });
  try {
    await dispatch.click(outer);
    expect(seen).toEqual(["click", "mousedown", "click"]);
    // Removed again once the outermost dispatch finishes.
    expect("event" in window).toBe(false);
  } finally {
    outer.remove();
    inner.remove();
  }
});

test("cancels a not-yet-run animation frame callback within the same frame", async () => {
  if (isBrowser) return;
  const ran: string[] = [];
  await new Promise<void>((resolve) => {
    let handleB = 0;
    requestAnimationFrame(() => {
      ran.push("a");
      cancelAnimationFrame(handleB);
      // Resolve on the next frame, by which point a wrongly-surviving "b" would
      // already have run in this frame and been recorded.
      requestAnimationFrame(() => resolve());
    });
    handleB = requestAnimationFrame(() => {
      ran.push("b");
    });
  });
  // "a" cancels "b" before "b" runs, so "b" must be skipped even though both
  // were requested for the same frame.
  expect(ran).toEqual(["a"]);
});
