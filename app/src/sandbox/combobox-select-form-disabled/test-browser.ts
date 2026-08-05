import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6892
  test("accessible disabled selects do not submit values", async ({ q }) => {
    await q.button("Submit transformed selects").click();

    await test
      .expect(q.status())
      .toHaveText("select-rendered, combobox-rendered");
  });

  // https://github.com/ariakit/ariakit/issues/6892
  test("aria-disabled selects do not submit values", async ({ q }) => {
    await test
      .expect(q.combobox("Select aria disabled"))
      .toHaveAttribute("aria-disabled", "true");
    await test
      .expect(q.combobox("Combobox aria disabled"))
      .toHaveAttribute("aria-disabled", "true");

    await q.button("Submit transformed selects").click();

    await test
      .expect(q.status())
      .toHaveText("select-rendered, combobox-rendered");
  });

  // https://github.com/ariakit/ariakit/issues/6892
  test("rendered disabled selects do not submit values", async ({ q }) => {
    await q.checkbox("Disable rendered selects").click();

    await test
      .expect(q.combobox("Select rendered"))
      .toHaveAttribute("aria-disabled", "true");
    await test
      .expect(q.combobox("Combobox rendered"))
      .toHaveAttribute("aria-disabled", "true");

    await q.button("Submit transformed selects").click();

    await test.expect(q.status()).toHaveText("No values submitted");
  });
});
