import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5058
  test("submits every selected value", async ({ q }) => {
    const combobox = q.combobox("Favorite fruits");
    await combobox.click();
    await q.option("Apple").click();
    await q.option("Orange").click();
    await combobox.fill("typed search");
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText('["apple","orange"]');
  });

  // https://github.com/ariakit/ariakit/issues/5058
  test("does not submit an empty search value", async ({ q }) => {
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText("[]");
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
  test("submits selected values when composite is false", async ({ page }) => {
    const values = await page
      .locator("form[data-composite-false]")
      .evaluate((form) =>
        new FormData(form as HTMLFormElement).getAll("non-composite-fruits"),
      );

    test.expect(values).toEqual(["apple"]);
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740398
  test("relays invalid events to the Combobox input", async ({ q }) => {
    await q.button("Validate required fruits").click();

    await test.expect(q.text("Invalid target: input")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740415
  test("keeps selected values in sync after form reset", async ({ q }) => {
    await q.combobox("Favorite fruits").click();
    await q.option("Apple").click();
    await q.button("Reset").click();
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText('["apple"]');
  });
});
