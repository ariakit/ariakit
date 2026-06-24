// @vitest-environment node
import { expect, test } from "vitest";
import { createFormStore } from "./form-store.ts";

// `@ariakit/components` is framework-agnostic, so its public store methods must
// work without a DOM. `requestAnimationFrame` is a browser-only global; before
// the fix, `validate()`/`submit()` awaited it unconditionally and threw
// `ReferenceError: requestAnimationFrame is not defined` outside the browser.
// See https://github.com/ariakit/ariakit/issues/6309

test("validate() resolves without requestAnimationFrame", async () => {
  expect(typeof requestAnimationFrame).toBe("undefined");
  const store = createFormStore({ defaultValues: { name: "" } });
  await expect(store.validate()).resolves.toBe(true);
});

test("submit() resolves without requestAnimationFrame", async () => {
  const store = createFormStore({ defaultValues: { name: "" } });
  let submitted = false;
  store.onSubmit(() => {
    submitted = true;
  });
  await expect(store.submit()).resolves.toBe(true);
  expect(submitted).toBe(true);
});
