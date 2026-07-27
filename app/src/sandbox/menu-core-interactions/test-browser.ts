import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("toggles with pointer and keyboard disclosure interactions", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await test.expect(q.menu()).not.toBeVisible();

    await button.click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await test.expect(q.menuitem("Edit")).not.toBeFocused();
    await button.click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(button).toBeFocused();

    for (const key of ["Enter", "Space"] as const) {
      await button.press(key);
      await test.expect(q.menu()).toBeVisible();
      await test.expect(q.menuitem("Edit")).toBeFocused();
      await test
        .expect(q.menuitem("Edit"))
        .toHaveAttribute("data-focus-visible");
      await page.keyboard.press("Shift+Tab");
      await test.expect(q.menu()).toBeVisible();
      await button.press(key);
      await test.expect(q.menu()).not.toBeVisible();
    }
  });

  test("opens with ArrowDown and Escape restores focus", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await button.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  test("opens with ArrowUp and Escape restores focus", async ({ page, q }) => {
    const button = q.button("Actions");
    await button.focus();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.menuitem("Report")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  test("outside interactions dismiss without restoring disclosure focus", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await button.click();
    await page.mouse.click(4, 4);
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(button).not.toBeFocused();

    await page.evaluate(() => {
      const outside = document.createElement("button");
      outside.textContent = "Outside";
      document.body.appendChild(outside);
    });
    await button.click();
    await q.button("Outside").click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(q.button("Outside")).toBeFocused();
  });

  test("Tab dismisses toward an outside element", async ({ page, q }) => {
    await page.evaluate(() => {
      const outside = document.createElement("button");
      outside.textContent = "Outside";
      document.body.appendChild(outside);
    });

    await q.button("Actions").click();
    await page.keyboard.press("Tab");
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(q.button("Outside")).toBeFocused();
  });

  test("Tab and Shift+Tab preserve the open-menu focus cycle", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await button.click();
    await page.keyboard.press("Shift+Tab");
    await test.expect(button).toBeFocused();
    await test.expect(q.menu()).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(q.menu()).toBeFocused();
    await test.expect(q.menu()).toBeVisible();

    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.menuitem("Edit")).not.toBeFocused();
    await test.expect(q.menu()).toBeVisible();
  });

  test("keyboard, pointer, disabled items, and typeahead update active item", async ({
    page,
    q,
  }) => {
    await q.button("Actions").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Share")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Report")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menuitem("Report")).toBeFocused();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(q.menuitem("Report")).toBeFocused();

    await q.menuitem("Share").hover();
    await test.expect(q.menuitem("Share")).toHaveAttribute("data-active-item");
    await test.expect(q.menu()).toBeFocused();
    await q.menuitem("Delete").hover({ force: true });
    await test
      .expect(q.menuitem("Share"))
      .not.toHaveAttribute("data-active-item");
    await test
      .expect(q.menuitem("Delete"))
      .not.toHaveAttribute("data-active-item");

    await page.keyboard.type("d");
    await test.expect(q.menu()).toBeFocused();
    await page.keyboard.type("re");
    await test.expect(q.menuitem("Report")).toBeFocused();
  });

  for (const activation of [
    "click",
    "Enter",
    "Space",
    "hover Enter",
    "hover Space",
  ] as const) {
    test(`activates an item with ${activation}`, async ({ page, q }) => {
      let dialogs = 0;
      page.on("dialog", async (dialog) => {
        dialogs += 1;
        await dialog.accept();
      });
      const button = q.button("Actions");
      if (activation.startsWith("hover")) {
        await button.click();
        await page.keyboard.press(
          activation.endsWith("Enter") ? "Enter" : "Space",
        );
        await test.expect.poll(() => dialogs).toBe(0);
        await q.menuitem("Edit").hover();
        await page.keyboard.press(
          activation.endsWith("Enter") ? "Enter" : "Space",
        );
      } else if (activation === "click") {
        await button.click();
        await q.menuitem("Edit").click();
      } else {
        await button.focus();
        await page.keyboard.press(activation);
        await test.expect(q.menuitem("Edit")).toBeFocused();
        await page.keyboard.press(activation);
      }
      await test.expect.poll(() => dialogs).toBe(1);
      await test.expect(q.menu()).not.toBeVisible();
      await test.expect(button).toBeFocused();
    });
  }

  // https://github.com/ariakit/ariakit/issues/3342
  test("renders the popover wrapper beside its disclosure", async ({
    page,
    q,
  }) => {
    await q.button("Actions").click();
    await test.expect
      .poll(async () =>
        page.evaluate(() => {
          const button = document.querySelector("button");
          const menu = document.querySelector('[role="menu"]');
          return button?.nextElementSibling === menu?.parentElement;
        }),
      )
      .toBe(true);
  });
});
