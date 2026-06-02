// oxlint-disable unbound-method
import { expect, test } from "vitest";
import { isBrowser, nextFrame, wrapAsync } from "./__utils.ts";

test("wrapAsync does not reapply browser polyfills when nested", async () => {
  const originalFocus = HTMLElement.prototype.focus;
  const originalGetClientRects = Element.prototype.getClientRects;

  await wrapAsync(async () => {
    const focus = HTMLElement.prototype.focus;
    const getClientRects = Element.prototype.getClientRects;

    if (!isBrowser) {
      expect(focus).not.toBe(originalFocus);
      expect(getClientRects).not.toBe(originalGetClientRects);
    }

    await wrapAsync(async () => {
      expect(HTMLElement.prototype.focus).toBe(focus);
      expect(Element.prototype.getClientRects).toBe(getClientRects);
    });

    expect(HTMLElement.prototype.focus).toBe(focus);
    expect(Element.prototype.getClientRects).toBe(getClientRects);
  });

  expect(HTMLElement.prototype.focus).toBe(originalFocus);
  expect(Element.prototype.getClientRects).toBe(originalGetClientRects);
});

test("wrapAsync does not reapply the act environment when nested", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "IS_REACT_ACT_ENVIRONMENT",
  );
  const values: Array<boolean | undefined> = [];
  let value: boolean | undefined = true;

  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    get: () => value,
    set: (nextValue: boolean | undefined) => {
      values.push(nextValue);
      value = nextValue;
    },
  });

  try {
    await wrapAsync(async () => {
      await wrapAsync(async () => {});
    });

    expect(values).toEqual([false, true]);
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", descriptor);
    } else {
      delete scope.IS_REACT_ACT_ENVIRONMENT;
    }
  }
});

test.skipIf(isBrowser)(
  "requestAnimationFrame batches same-frame callbacks with a shared timestamp",
  async () => {
    const order: string[] = [];
    const times: number[] = [];
    requestAnimationFrame((time) => {
      order.push("a");
      times.push(time);
    });
    requestAnimationFrame((time) => {
      order.push("b");
      times.push(time);
    });
    await nextFrame();
    expect(order).toEqual(["a", "b"]);
    expect(times[0]).toBe(times[1]);
  },
);

test.skipIf(isBrowser)(
  "requestAnimationFrame scheduled during a flush runs on the next frame",
  async () => {
    const calls: string[] = [];
    requestAnimationFrame(() => {
      calls.push("a");
      requestAnimationFrame(() => calls.push("nested"));
    });
    await nextFrame();
    expect(calls).toEqual(["a"]);
    await nextFrame();
    expect(calls).toEqual(["a", "nested"]);
  },
);

test.skipIf(isBrowser)(
  "cancelAnimationFrame prevents a scheduled callback from running",
  async () => {
    const calls: string[] = [];
    const id = requestAnimationFrame(() => calls.push("x"));
    cancelAnimationFrame(id);
    await nextFrame();
    expect(calls).toEqual([]);
  },
);

test.skipIf(isBrowser)(
  "cancelAnimationFrame skips a sibling callback queued for the current frame",
  async () => {
    const calls: string[] = [];
    let siblingId = 0;
    requestAnimationFrame(() => {
      calls.push("a");
      cancelAnimationFrame(siblingId);
    });
    siblingId = requestAnimationFrame(() => calls.push("b"));
    requestAnimationFrame(() => calls.push("c"));
    await nextFrame();
    expect(calls).toEqual(["a", "c"]);
  },
);
