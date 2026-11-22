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
    // that it's skipped. The copy button in the code comes before the expand
    // button.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Show all 36 lines")).toBeFocused();
  });

  test("copies the collapsed code without expanding it", async ({
    context,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // The copy button is in the scroll area, and the click target of the expand
    // button covers the scroll area, so the copy button stays above it.
    await q.button("Copy use-users.ts").click();
    await test.expect(q.button("Copied")).toBeVisible();
    await test.expect(q.button("Show all 36 lines")).toBeVisible();
  });

  test("doesn't scroll the expanded code when the copy button takes the focus", async ({
    page,
    q,
  }) => {
    const code = page.locator("pre");
    const getScrollTop = () => code.evaluate((element) => element.scrollTop);
    await q.button("Show all 36 lines").click();
    await test.expect(q.region("use-users.ts")).toBeFocused();
    await code.evaluate((element) => {
      element.scrollTop = 60;
    });
    // The copy button sticks to the corner of the code, inside its padding, so
    // a scroll padding would scroll the code a bit more on each focus.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
    test.expect(await getScrollTop()).toBe(60);
  });

  test("puts the collapse button after the code and its copy button in the tab order", async ({
    page,
    q,
  }) => {
    await q.button("Show all 36 lines").click();
    await test.expect(q.region("use-users.ts")).toBeFocused();
    // The copy button is in the panel of the code, and the collapse button is
    // in a row under it.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-users.ts")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Show fewer lines")).toBeFocused();
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
