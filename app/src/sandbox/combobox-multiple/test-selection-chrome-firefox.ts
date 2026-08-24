import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("ranges, duplicates, and filtered membership use value keys", async ({
    q,
  }) => {
    const combobox = q.combobox("Your favorite food");
    const selection = q.status("Editable selection");
    await combobox.click();

    await q.option("Banana").click();
    await q.option("Cake").click({ modifiers: ["Shift"] });
    await test
      .expect(selection)
      .toHaveText("5 selected: Bacon, Banana, Broccoli, Burger, Cake");

    await combobox.fill("apple");
    await q.option("Apple").click();
    await combobox.fill("apple");
    await test
      .expect(q.option("Apple"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Apple — market pick"))
      .toHaveAttribute("aria-selected", "true");

    await combobox.fill("app");
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.option("Burger")).toHaveCount(0);
    await test.expect(selection).toContainText("Burger");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("compares disabled and legacy click mutation", async ({ q }) => {
    const selection = q.status("Editable selection");
    await q.combobox("Your favorite food").click();

    await q.option("Native handler off").click();
    await test.expect(selection).toHaveText("1 selected: Bacon");
    await test
      .expect(q.status("Gate calls"))
      .toHaveText("Gate callback calls: 1");

    await q.option("Composite opt-out").click();
    await test.expect(selection).toHaveText("1 selected: Bacon");

    await q.option("Legacy toggle").click();
    await test.expect(selection).toHaveText("2 selected: Bacon, Legacy toggle");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("skips an explicit false registration inside a range", async ({ q }) => {
    await q.combobox("Your favorite food").click();
    await q.option("Range start").click();
    await q.option("Range end").click({ modifiers: ["Shift"] });

    await test
      .expect(q.status("Editable selection"))
      .toHaveText("3 selected: Bacon, Range start, Range end");
    await test
      .expect(q.option("Composite opt-out"))
      .toHaveAttribute("aria-selected", "false");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps modified link navigation outside selection", async ({
    page,
    context,
    q,
  }) => {
    await q.combobox("Your favorite food").click();
    const guide = q.option("Selection guide");
    const selection = q.status("Editable selection");
    const modifier = await page.evaluate(() =>
      navigator.platform.startsWith("Mac") ? "Meta" : "Control",
    );

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      guide.click({ modifiers: [modifier] }),
    ]);
    await test.expect(newPage).toHaveURL(/#selection-contract$/);
    await newPage.close();
    await test.expect(guide).toHaveAttribute("aria-selected", "false");
    await test.expect(selection).toHaveText("1 selected: Bacon");

    await guide.click({ modifiers: ["Alt"] });
    await test.expect(guide).toHaveAttribute("aria-selected", "false");
    await test.expect(selection).toHaveText("1 selected: Bacon");
  });
});
