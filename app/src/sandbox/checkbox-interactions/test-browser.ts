import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders native checkbox semantics and supports Tab and Space", async ({
    page,
    q,
  }) => {
    const terms = q.checkbox("Terms");
    await test.expect(terms).toHaveAttribute("type", "checkbox");
    await test.expect(terms).toHaveAttribute("aria-checked", "false");

    await page.keyboard.press("Tab");
    await test.expect(terms).toBeFocused();

    await page.keyboard.press("Space");
    await test.expect(terms).toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(terms).not.toBeChecked();
  });

  test("keeps each checkbox implementation in the tab order", async ({
    page,
    q,
  }) => {
    const names = [
      "Terms",
      "Controlled",
      "Store",
      "Valued",
      "Dynamic 1",
      "Dynamic 2",
      "Button checkbox: Unchecked",
      "Custom",
      "Apple",
      "Orange",
      "Mango",
    ];

    for (const name of names) {
      await page.keyboard.press("Tab");
      await test.expect(q.checkbox(name)).toBeFocused();
    }
  });

  test("supports uncontrolled, controlled, store, and valued checkboxes", async ({
    page,
    q,
  }) => {
    const terms = q.checkbox("Terms");
    const controlled = q.checkbox("Controlled");
    const store = q.checkbox("Store");
    const valued = q.checkbox("Valued");

    await test.expect(terms).not.toBeChecked();
    await q.text("Terms").click();
    await test.expect(terms).toBeChecked();

    await test.expect(controlled).toBeChecked();
    await controlled.click();
    await test.expect(controlled).not.toBeChecked();

    await test.expect(store).toBeChecked();
    await q.text("Store").click();
    await test.expect(store).not.toBeChecked();
    await store.focus();
    await page.keyboard.press("Space");
    await test.expect(store).toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(store).not.toBeChecked();

    await test.expect(valued).toHaveAttribute("value", "accept");
    await q.text("Valued").click();
    await test.expect(valued).toBeChecked();
    await valued.focus();
    await page.keyboard.press("Space");
    await test.expect(valued).not.toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(valued).toBeChecked();
  });

  test("updates dynamically linked checkbox stores", async ({ q }) => {
    const first = q.checkbox("Dynamic 1");
    const second = q.checkbox("Dynamic 2");

    await test.expect(first).toBeChecked();
    await test.expect(second).toBeChecked();

    await first.click();
    await test.expect(first).not.toBeChecked();
    await test.expect(second).not.toBeChecked();

    await first.click();
    await test.expect(first).toBeChecked();
    await test.expect(second).toBeChecked();

    await second.click();
    await test.expect(first).not.toBeChecked();
    await test.expect(second).not.toBeChecked();

    await second.click();
    await test.expect(first).not.toBeChecked();
    await test.expect(second).toBeChecked();
  });

  test("supports a checkbox rendered as a button", async ({ page, q }) => {
    const unchecked = q.checkbox("Button checkbox: Unchecked");
    await test.expect(unchecked).toHaveRole("checkbox");
    await test.expect(unchecked).toHaveAttribute("aria-checked", "false");

    await unchecked.click();
    const checked = q.checkbox("Button checkbox: Checked");
    await test.expect(checked).toHaveAttribute("aria-checked", "true");

    await checked.click();
    await test
      .expect(q.checkbox("Button checkbox: Unchecked"))
      .toHaveAttribute("aria-checked", "false");

    await unchecked.click();
    await test
      .expect(q.checkbox("Button checkbox: Checked"))
      .toHaveAttribute("aria-checked", "true");

    await checked.focus();
    await page.keyboard.press("Space");
    await test
      .expect(q.checkbox("Button checkbox: Unchecked"))
      .toHaveAttribute("aria-checked", "false");

    await page.keyboard.press("Space");
    await test
      .expect(q.checkbox("Button checkbox: Checked"))
      .toHaveAttribute("aria-checked", "true");

    await page.keyboard.press("Enter");
    await test
      .expect(q.checkbox("Button checkbox: Unchecked"))
      .toHaveAttribute("aria-checked", "false");

    await page.keyboard.press("Enter");
    await test
      .expect(q.checkbox("Button checkbox: Checked"))
      .toHaveAttribute("aria-checked", "true");
  });

  test("supports a custom visually hidden checkbox", async ({ page, q }) => {
    const checkbox = q.checkbox("Custom");
    await test.expect(checkbox).toBeChecked();

    await q.text("Custom").click();
    await test.expect(checkbox).not.toBeChecked();

    await q.text("Custom").click();
    await test.expect(checkbox).toBeChecked();

    await checkbox.focus();
    await page.keyboard.press("Space");
    await test.expect(checkbox).not.toBeChecked();

    await page.keyboard.press("Space");
    await test.expect(checkbox).toBeChecked();

    await page.keyboard.press("Enter");
    await test.expect(checkbox).not.toBeChecked();

    await page.keyboard.press("Enter");
    await test.expect(checkbox).toBeChecked();
  });

  test("updates independent values in a checkbox group", async ({
    page,
    q,
  }) => {
    const group = q.group("Favorite fruits");
    const apple = q.checkbox("Apple");
    const orange = q.checkbox("Orange");
    const mango = q.checkbox("Mango");

    await test.expect(group).toHaveAttribute("role", "group");
    await test.expect(apple).not.toBeChecked();
    await test.expect(orange).not.toBeChecked();
    await test.expect(mango).not.toBeChecked();

    await apple.click();
    await test.expect(apple).toBeChecked();
    await test.expect(orange).not.toBeChecked();
    await test.expect(mango).not.toBeChecked();

    await apple.click();
    await mango.click();
    await test.expect(apple).not.toBeChecked();
    await test.expect(orange).not.toBeChecked();
    await test.expect(mango).toBeChecked();

    await apple.focus();
    await page.keyboard.press("Space");
    await test.expect(apple).toBeChecked();

    await orange.focus();
    await page.keyboard.press("Space");
    await test.expect(apple).toBeChecked();
    await test.expect(orange).toBeChecked();
    await test.expect(mango).toBeChecked();
  });
});
