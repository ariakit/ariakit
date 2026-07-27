import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("navigates a non-looping composite", async ({ page, q }) => {
    const apple = q.button("Apple");
    const grape = q.button("Grape");
    const orange = q.button("Orange");
    await test.expect(apple).not.toBeFocused();
    await test.expect(apple).toHaveAttribute("data-active-item");

    await page.keyboard.press("Tab");
    await test.expect(apple).toBeFocused();
    await test.expect(apple).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await test.expect(grape).toBeFocused();
    await test.expect(grape).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await test.expect(orange).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(grape).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(orange).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(grape).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(orange).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/4083
  test("moves focus-visible state to the next item", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    const apple = q.button("Apple");
    const grape = q.button("Grape");
    await test.expect(apple).toHaveAttribute("data-focus-visible", "true");
    await test.expect(apple).toHaveAttribute("data-active-item", "true");

    await page.keyboard.press("ArrowDown");
    await test.expect(apple).not.toHaveAttribute("data-focus-visible");
    await test.expect(apple).not.toHaveAttribute("data-active-item");
    await test.expect(grape).toHaveAttribute("data-focus-visible", "true");
    await test.expect(grape).toHaveAttribute("data-active-item", "true");
  });

  test("navigates a grid without focus shifting", async ({ page, q }) => {
    await q.gridcell("0A1").click();
    for (const [key, name] of [
      ["ArrowDown", "0B1"],
      ["ArrowRight", "0B2"],
      ["ArrowDown", "0C2"],
      ["ArrowRight", "0C3"],
      ["ArrowUp", "0A3"],
      ["ArrowDown", "0C3"],
    ] as const) {
      await page.keyboard.press(key);
      await test.expect(q.gridcell(name)).toBeFocused();
    }
  });

  test("navigates a grid with focus shifting", async ({ page, q }) => {
    await q.gridcell("1A1").click();
    for (const [key, name] of [
      ["ArrowDown", "1B1"],
      ["ArrowRight", "1B2"],
      ["ArrowDown", "1C2"],
      ["ArrowRight", "1C3"],
      ["ArrowUp", "1B2"],
      ["ArrowUp", "1A2"],
      ["ArrowRight", "1A3"],
      ["ArrowDown", "1B2"],
      ["ArrowDown", "1C2"],
    ] as const) {
      await page.keyboard.press(key);
      await test.expect(q.gridcell(name)).toBeFocused();
    }
  });
});
