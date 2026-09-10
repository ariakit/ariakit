import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973490977
  test("displays zero counts instead of the selected value", async ({ q }) => {
    await test.expect(q.combobox("Unread messages")).toHaveText("0");
    await test.expect(q.combobox("Open issues")).toHaveText("0");
    await q.combobox("Open issues").click();
    await test.expect(q.option("0")).toBeVisible();
    await q.option("0").click();
    await test.expect(q.listbox()).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973273374
  test("opens and selects with a supplied store", async ({ q }) => {
    const select = q.combobox("Fruit");
    await test.expect(select).toHaveText("Apple");
    await select.click();
    await test.expect(q.option("Orange")).toBeVisible();
    await q.option("Orange").click();
    await test.expect(select).toHaveText("Orange");
    await test.expect(q.text("Selected fruit: Orange")).toBeVisible();
    await test.expect(q.listbox()).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("falls back from false labels and keeps conditional options named", async ({
    q,
  }) => {
    const button = q.combobox("Status filter");
    await test.expect(button).toHaveText("Open");
    await test.expect(q.combobox("Status summary")).toHaveText("0Summary");
    await button.click();
    await q.option("Closed").click();
    await test.expect(button).toHaveText("Closed");
    await q.checkbox("Show status labels").check();
    await test.expect(button).toContainText("Custom status");
    await button.click();
    await test.expect(q.option("Closed status")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("omits false icon slots and preserves zero icons", async ({ q }) => {
    const button = q.combobox("Status filter");
    await test.expect(button.locator(":scope > *")).toHaveCount(1);
    await button.click();
    const options = q.option();
    await test.expect(options.nth(0).locator(":scope > *")).toHaveCount(1);
    await test.expect(options.nth(1).locator(":scope > *")).toHaveCount(1);
    await test.expect(q.option(/^0\s*No activity$/)).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("preserves intentional empty strings", async ({ q }) => {
    await test.expect(q.combobox("Blank display")).toHaveText("");
    await test.expect(q.combobox("Blank summary")).toHaveText("");
    await q.combobox("Status filter").click();
    await test.expect(q.option("Blank status")).toHaveText("");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223972
  test("keeps the badge size when an optional size is undefined", async ({
    q,
  }) => {
    const defaultStatus = q.combobox("Default status");
    const fontSize = await defaultStatus.evaluate(
      (element) => getComputedStyle(element).fontSize,
    );
    await test
      .expect(q.combobox("Optional status"))
      .toHaveCSS("font-size", fontSize);
    await test
      .expect(q.combobox("Large status"))
      .not.toHaveCSS("font-size", fontSize);
  });
});
