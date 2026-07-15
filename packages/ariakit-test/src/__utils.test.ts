import { expect, test } from "vitest";
import { wrapAsync } from "./__utils.ts";

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
