import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6336
  test("checkbox keeps role and toggling after swapping the render element", async ({
    q,
  }) => {
    const checkbox = q.checkbox("Accept terms");

    await checkbox.click();
    await test.expect(q.text("checked: true")).toBeVisible();

    await q.button("Use custom checkbox").click();

    await test.expect(checkbox).toBeVisible();
    await test.expect(checkbox).not.toHaveAttribute("type");
    await test.expect(checkbox).toHaveAttribute("tabindex", "0");

    await checkbox.click();
    await test.expect(q.text("checked: false")).toBeVisible();

    await checkbox.press(" ");
    await test.expect(q.text("checked: true")).toBeVisible();

    await q.button("Use native checkbox").click();

    await test.expect(checkbox).toHaveAttribute("type", "checkbox");

    await checkbox.click();
    await test.expect(q.text("checked: false")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/6336
  test("button keeps role and keyboard activation after swapping the render element", async ({
    q,
  }) => {
    const button = q.button("Submit");

    await button.click();
    await test.expect(q.text("submit clicks: 1")).toBeVisible();

    await q.button("Use custom submit").click();

    await test.expect(button).toBeVisible();
    await test.expect(button).not.toHaveAttribute("type");
    await test.expect(button).toHaveAttribute("tabindex", "0");

    await button.click();
    await test.expect(q.text("submit clicks: 2")).toBeVisible();

    await button.press("Enter");
    await test.expect(q.text("submit clicks: 3")).toBeVisible();

    await button.press(" ");
    await test.expect(q.text("submit clicks: 4")).toBeVisible();

    await q.button("Use native submit").click();

    await test.expect(button).toHaveAttribute("type", "button");

    await button.click();
    await test.expect(q.text("submit clicks: 5")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/6336
  test("button regains native button props after swapping from a custom element", async ({
    q,
  }) => {
    const button = q.button("Save");

    await button.click();
    await test.expect(q.text("save clicks: 1")).toBeVisible();

    await q.button("Use native save").click();

    await test.expect(button).toHaveAttribute("type", "button");
    await test.expect(button).not.toHaveAttribute("role");

    await button.click();
    await test.expect(q.text("save clicks: 2")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/6336
  test("combobox list updates aria-multiselectable after swapping the render element", async ({
    q,
  }) => {
    await test
      .expect(q.listbox("Fruits"))
      .toHaveAttribute("aria-multiselectable", "true");

    await q.button("Use dialog list").click();

    await test.expect(q.dialog("Fruits")).toBeVisible();
    await test
      .expect(q.dialog("Fruits"))
      .not.toHaveAttribute("aria-multiselectable");

    await q.button("Use listbox list").click();

    await test
      .expect(q.listbox("Fruits"))
      .toHaveAttribute("aria-multiselectable", "true");
  });
});
