// @vitest-environment jsdom
// Uses DOM APIs the default node test environment doesn't provide.
// oxlint-disable unbound-method
import { expect, test } from "vitest";
import { isBrowser, wrapAsync } from "./__utils.ts";

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
