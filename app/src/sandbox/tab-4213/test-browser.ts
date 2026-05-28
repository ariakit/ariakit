import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4213
  test("moves focus after controlled tab selection", async ({ page, q }) => {
    await q.tab("Vegetables").focus();
    await test.expect(q.tab("Vegetables")).toBeFocused();

    await q.tab("Vegetables").click();

    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Meat")).toBeFocused();

    await page.keyboard.press("ArrowRight");

    await test.expect(q.tab("Fruits")).toBeFocused();
  });

  test("does not move focus after controlled tab selection outside the tab list", async ({
    page,
    q,
  }) => {
    const button = page.getByRole("button", { name: "Select vegetables" });
    await button.click();
    await test.expect(button).toBeFocused();

    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(button).toBeFocused();
  });

  test("does not move focus after controlled tab selection inside a tab panel", async ({
    page,
    q,
  }) => {
    const textbox = page.getByRole("textbox", { name: "Fruit note" });
    await textbox.focus();
    await test.expect(textbox).toBeFocused();

    await test.expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
    await test.expect(textbox).toBeFocused();
  });

  test("does not move focus after controlled selection of a disabled tab", async ({
    page,
    q,
  }) => {
    await q.tab("Fruits").focus();
    await test.expect(q.tab("Fruits")).toBeFocused();

    await page.keyboard.press("d");

    await test.expect(q.tab("Dairy")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Fruits")).toBeFocused();
  });
});
