import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("does not copy inherited aria attributes", async ({ q }) => {
    await q.button("Inspect listbox").click();

    await test.expect(q.status("Listbox aria-hidden")).toHaveText("not set");
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("does not copy an inherited role", async ({ q }) => {
    await q.button("Inspect listbox").click();

    await test.expect(q.status("Listbox role")).toHaveText("listbox");
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("does not use an inherited aria-label", async ({ q }) => {
    await test.expect(q.listbox("Tags")).toBeAttached();
  });
});
