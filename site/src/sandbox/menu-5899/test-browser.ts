import { withFramework } from "#app/test-utils/preview.ts";

const menuButtons = ["Boolean", "Callback"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves menu button focus when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.click();

      await test.expect(q.menu(menuButtonName)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("focuses menu items on arrow key show when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.focus();
      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("does not focus the menu container before keyboard item focus", async ({
    page,
    q,
  }) => {
    await page.evaluate(() => {
      document.addEventListener(
        "focusin",
        (event) => {
          const element = event.target as HTMLElement;
          const role = element.getAttribute("role") || element.tagName;
          const focusLog = JSON.parse(
            sessionStorage.getItem("menu-5899-focus-log") || "[]",
          ) as string[];
          focusLog.push(role);
          sessionStorage.setItem(
            "menu-5899-focus-log",
            JSON.stringify(focusLog),
          );
        },
        { capture: true },
      );
    });

    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await page.evaluate(() => {
        sessionStorage.setItem("menu-5899-focus-log", "[]");
      });
      await menuButton.focus();
      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      const focusLog = await page.evaluate(() => {
        return JSON.parse(
          sessionStorage.getItem("menu-5899-focus-log") || "[]",
        ) as string[];
      });
      test.expect(focusLog).toContain("menuitem");
      test.expect(focusLog).not.toContain("menu");

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("focuses menu items on keyboard click when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.focus();
      await page.keyboard.press("Enter");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("preserves menu-specific auto focus guard for callback true", async ({
    q,
  }) => {
    const toggleButton = q.button("Toggle Callback True");
    const menu = q.menu("Callback True");

    await toggleButton.click();

    await test.expect(menu).toBeVisible();
    await test.expect(toggleButton).toBeFocused();

    await toggleButton.click();

    await test.expect(menu).not.toBeVisible();
    await test.expect(toggleButton).toBeFocused();
  });

  test("preserves callback side effects on keyboard show", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Callback Side Effect");
    const menuItem = q.menuitem("Side Effect Edit");

    await menuButton.focus();
    await page.keyboard.press("ArrowDown");

    await test.expect(menuItem).toBeFocused();
    await test
      .expect(menuItem)
      .toHaveAttribute("data-callback-side-effect", "true");
  });
});
