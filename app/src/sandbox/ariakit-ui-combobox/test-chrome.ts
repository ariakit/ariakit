import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The lists held open in this sandbox mark every list that already exists
  // when they open as outside them, and Ariakit then ignores Escape on it. The
  // lists that tests open render in a portal and mount on open to avoid the
  // marks, and these tests guard that they still close on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live combobox list on Escape", async ({ page, q }) => {
    const input = q.combobox("Destination");
    await input.click();
    const list = q.listbox("Destination");
    await test.expect(list).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(list).toBeHidden();
    await test.expect(input).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live select lists on Escape", async ({ page, q }) => {
    for (const name of ["Favorite fruit", "Review status"]) {
      const select = q.combobox(name);
      await select.click();
      const list = q.listbox(name);
      await test.expect(list).toBeVisible();
      await page.keyboard.press("Escape");
      await test.expect(list).toBeHidden();
      await test.expect(select).toBeFocused();
    }
  });

  test("filters, completes inline and closes on Enter", async ({ q }) => {
    const input = q.combobox("Destination");
    await input.click();
    const list = q.listbox("Destination");
    await test.expect(list).toBeVisible();
    // The popover renders in a portal, outside the box.
    await test
      .expect(query(q.article("Default")).listbox("Destination"))
      .toHaveCount(0);
    await input.pressSequentially("Den");
    await test.expect(input).toHaveValue("Denmark");
    await test.expect(query(list).option()).toHaveCount(1);
    await input.press("Enter");
    await test.expect(list).toBeHidden();
    await test.expect(input).toHaveValue("Denmark");
  });

  test("shows the empty state when nothing matches", async ({ q }) => {
    const input = q.combobox("Destination");
    await input.click();
    await input.pressSequentially("xyz");
    const list = q.listbox("Destination");
    await test.expect(query(list).option()).toHaveCount(0);
    await test.expect(query(list).text("No results found")).toBeVisible();
  });

  test("renders the select list in a portal", async ({ q }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();
    await test.expect(q.listbox("Favorite fruit")).toBeVisible();
    await test
      .expect(query(q.article("Default select")).listbox("Favorite fruit"))
      .toHaveCount(0);
    await q.option("Cherry").click();
    await test.expect(select).toHaveText("Cherry");
    await test.expect(q.listbox("Favorite fruit")).toBeHidden();
  });

  test("counts one selected label in the singular", async ({ q }) => {
    const select = query(q.article("Selection count")).combobox("Issue labels");
    await test.expect(select).toHaveText("2 labels");
    await select.click();
    await query(q.listbox("Issue labels")).option("Docs").click();
    await test.expect(select).toHaveText("1 label");
  });

  test("lets a long select list scroll inside its height cap", async ({
    page,
    q,
  }) => {
    const list = query(q.article("Long list")).listbox("Start time");
    await list.hover();
    await page.mouse.wheel(0, 400);
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0);
  });

  test("joins the values of a multiple selection", async ({ q }) => {
    const article = query(q.article("Multiple selection"));
    await test
      .expect(article.combobox("Toppings"))
      .toHaveText("Cheese, Olives");
    await test
      .expect(article.option("Cheese"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(article.option("Olives"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("shows the chosen status on the badge select", async ({ q }) => {
    const select = q.combobox("Review status");
    await test.expect(select).toHaveText("In review");
    await select.click();
    await q.option("Published").click();
    await test.expect(select).toHaveText("Published");
    await test.expect(q.listbox("Review status")).toBeHidden();
  });

  // Regression fixtures.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973490977
  test("displays zero counts instead of the selected value", async ({ q }) => {
    await test.expect(q.combobox("Unread messages")).toHaveText("0");
    await test.expect(q.combobox("Open issues")).toHaveText("0");
    await q.combobox("Open issues").click();
    await test.expect(q.option("0")).toBeVisible();
    await q.option("0").click();
    // The combobox-item-highlight list stays open in this sandbox, so the query
    // names the list that closes.
    await test.expect(q.listbox("Open issues")).toBeHidden();
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
    // The combobox-item-highlight list stays open in this sandbox, so the query
    // names the list that closes.
    await test.expect(q.listbox("Fruit")).toBeHidden();
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
    // Other lists are open in this sandbox, so the options come from this one.
    const options = query(q.listbox("Status filter")).option();
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

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps an editable input when an optional render is undefined", async ({
    q,
  }) => {
    await q.textbox("Project name").fill("Website");
    await test.expect(q.text("Project: Website")).toBeVisible();
    await q.textbox("Notes").fill("First line\nSecond line");
    await test
      .expect(q.textbox("Notes"))
      .toHaveValue("First line\nSecond line");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the combobox list in a portal with optional position props", async ({
    q,
  }) => {
    await q.combobox("Assignee").click();
    await test.expect(q.listbox("Assignee")).toBeVisible();
    await test
      .expect(query(q.region("Project editor")).listbox())
      .toHaveCount(0);
  });
});
