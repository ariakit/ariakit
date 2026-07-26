import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders fallback, selected value, and item state", async ({ q }) => {
    const select = q.combobox("Favorite fruit");
    const renderedValue = q.status("Rendered favorite fruit");

    await test.expect(select).toHaveText("Apple");
    await test.expect(renderedValue).toHaveText("Rendered fruit: Apple");

    await select.click();
    await test
      .expect(q.option("Apple").locator("[data-selected]"))
      .toBeVisible();
    await q.option("Banana").click();

    await test.expect(select).toHaveText("Banana");
    await test.expect(renderedValue).toHaveText("Rendered fruit: Banana");

    await select.click();
    await q.option("Clear selection").click();

    await test.expect(select).toHaveText("No fruit");
    await test.expect(renderedValue).toHaveText("Rendered fruit: No fruit");
  });

  test("heading labels the popover and nested list", async ({ q }) => {
    await q.combobox("Favorite fruit").click();

    await test.expect(q.dialog("Fruit options")).toBeVisible();
    await test.expect(q.listbox("Fruit options")).toBeVisible();

    await q.button("Dismiss fruit options").click();

    await test.expect(q.dialog("Fruit options")).toBeHidden();
  });

  test("restores the selected value on Escape", async ({ page, q }) => {
    const select = q.combobox("Preview fruit");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(select).toHaveText("Apple");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3647555720
  test("keeps a disabled filterable select out of the tab order", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Disabled fruit");
    await test.expect(select).toBeDisabled();

    await q.textbox("Before disabled select").focus();
    await page.keyboard.press("Tab");

    await test.expect(q.textbox("After disabled select")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3647555511
  test("preserves the input value when resetValueOnSelect is false", async ({
    q,
  }) => {
    const input = q.combobox("Persistent fruit filter");
    await input.fill("ap");
    await q.option("Apple").click();

    await test.expect(input).toHaveValue("ap");
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("preserves a select input value when resetValueOnSelect is false", async ({
    q,
  }) => {
    await q.combobox("Persistent select fruit").click();
    const input = q.combobox("Persistent select fruit filter");
    await input.fill("ap");
    await q.option("Apple").click();

    await test.expect(input).toHaveValue("ap");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3647556185
  test("preserves aria-selected on menu-role multi-select items", async ({
    q,
  }) => {
    await q.combobox("Menu fruit filter").click();

    await test
      .expect(q.menuitem("Apple"))
      .toHaveAttribute("aria-selected", "true");
  });
});
