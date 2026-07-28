import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6858
  test("does not lose the opening selection to immediate pointer movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Pointer race");
    const selected = q.option("Item 24");
    const listbox = q.listbox("Pointer race options");
    const activeItem = listbox.locator("[data-active-item]");

    const selectBox = await select.boundingBox();
    if (!selectBox) {
      throw new Error("The select is not visible.");
    }
    const selectX = selectBox.x + selectBox.width / 2;
    const selectY = selectBox.y + selectBox.height / 2;
    const listX = selectX;
    const listY = selectBox.y + selectBox.height + 12;

    // The fixed path presents the selection before pointer entry. The broken
    // path lets this hover retarget the pending scroll, leaving it offscreen.
    await page.mouse.move(selectX, selectY);
    await page.mouse.down();
    await page.mouse.up();
    await page.mouse.move(listX, listY);

    await test.expect(activeItem).toHaveCount(1);
    await test.expect(activeItem).not.toHaveText("Item 24");
    await test.expect(selected).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6858
  test("presents the selection when its item registers late", async ({ q }) => {
    await q.combobox("Late items").click();

    const selected = q.option("Item 24");
    await test.expect(selected).toHaveCount(0);
    await test.expect(selected).toBeVisible({ timeout: 2_000 });
    await test.expect(selected).toHaveAttribute("data-active-item");
    await test.expect(selected).toBeInViewport();
  });

  test("auto-selects the first filtered option and restores it on reopen", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Searchable favorite fruit");
    const search = q.combobox("Search fruits");
    await select.click();
    await page.keyboard.type("c");
    await test.expect(q.option("Cake")).toHaveAttribute("data-active-item");
    await page.keyboard.type("h");
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
    await page.keyboard.type("o");
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");

    await select.click();
    await test
      .expect(q.option("Chocolate"))
      .toHaveAttribute("data-active-item");
    await search.fill("a");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.type("s");
    await test.expect(q.option("Pasta")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Backspace");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
  });

  test("reopening scrolls a far selected option without scrolling the page", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Searchable favorite fruit");
    const listbox = q.dialog("Searchable favorite fruit options");
    await select.click();
    await q.option("Watermelon").click();
    await page.evaluate(() => window.scrollTo({ top: 100 }));

    await select.click();

    await test.expect(q.option("Watermelon")).toBeInViewport();
    await test.expect(listbox).toBeVisible();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  for (const key of ["ArrowUp", "ArrowDown"]) {
    test(`${key} opens the searchable select without scrolling the page`, async ({
      page,
      q,
    }) => {
      await q.combobox("Searchable favorite fruit").focus();
      await page.evaluate(() => window.scrollTo({ top: 100 }));
      await page.keyboard.press(key);
      await test
        .expect(q.dialog("Searchable favorite fruit options"))
        .toBeVisible();
      test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
    });
  }

  test("moves grouped options into view and restores the selection on reopen", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Grouped favorite food");
    const listbox = q.listbox("Grouped favorite food");
    await select.click();
    for (let index = 0; index < 7; index += 1) {
      await page.keyboard.press("ArrowDown");
    }
    await test.expect(q.option("Water")).toBeInViewport();

    await page.keyboard.type("cc");
    await test.expect(q.option("Chips")).toBeInViewport();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await test.expect(q.option("Chips")).toBeInViewport();

    await listbox.evaluate((element) => element.scrollTo({ top: 0 }));
    await page.keyboard.press("Escape");
    await page.keyboard.press("Enter");
    await test.expect(q.option("Chips")).toBeInViewport();
  });

  test("opens the grouped select without scrolling the page", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.evaluate(() => {
      document.body.style.paddingTop = "250px";
    });
    const select = q.combobox("Grouped favorite food");
    await select.click();
    await test.expect(q.listbox("Grouped favorite food")).toBeVisible();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo({ top: 350 }));
    await select.click();
    await test.expect(q.listbox("Grouped favorite food")).toBeVisible();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(350);
  });
});
