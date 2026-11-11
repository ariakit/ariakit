import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("expands from a click anywhere on the collapsed code", async ({
    page,
    q,
  }) => {
    const code = page.locator("pre");
    // Expanded code can still scroll inside, up to the height of the screen, so
    // the height of the area tells the states apart.
    const getHeight = () => code.evaluate((element) => element.clientHeight);
    const collapsedHeight = await getHeight();
    // The top of the code is far from the button at the bottom.
    const box = await code.boundingBox();
    if (!box) throw new Error("Missing code box");
    await page.mouse.click(box.x + 80, box.y + 40);
    await test.expect(q.region("use-users.ts")).toBeFocused();
    await test.expect.poll(getHeight).toBeGreaterThan(collapsedHeight);
    await q.button("Show fewer lines").click();
    await test.expect(q.button("Show all 36 lines")).toBeFocused();
    await test.expect.poll(getHeight).toBe(collapsedHeight);
  });

  test("skips the collapsed code in the tab order", async ({ page, q }) => {
    // The collapsed code comes first on the page, so the first tab stop shows
    // that it's skipped. The copy button over the code comes last.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Show all 36 lines")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
  });

  test("puts the collapse button right after the expanded code in the tab order", async ({
    page,
    q,
  }) => {
    await q.button("Show all 36 lines").click();
    await test.expect(q.region("use-users.ts")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Show fewer lines")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
  });

  test("fits the expanded block on the screen", async ({ q }) => {
    // All 36 lines are taller than the screen, so the code scrolls inside and
    // the title and the collapse button stay in view.
    await q.button("Show all 36 lines").click();
    await test.expect(q.text("use-users.ts")).toBeInViewport({ ratio: 1 });
    await test
      .expect(q.button("Show fewer lines"))
      .toBeInViewport({ ratio: 1 });
  });

  test("shows the first lines again after a scroll inside the expanded code", async ({
    page,
    q,
  }) => {
    const code = page.locator("pre");
    const firstLine = code.locator(".line").first();
    await q.button("Show all 36 lines").click();
    // The expanded code stops at a height that follows the screen and scrolls
    // inside, so a wheel over it scrolls the code, not the page.
    await code.hover();
    await page.mouse.wheel(0, 2000);
    await test.expect(firstLine).not.toBeInViewport();
    await q.button("Show fewer lines").click();
    await test.expect(firstLine).toBeInViewport();
  });
});
