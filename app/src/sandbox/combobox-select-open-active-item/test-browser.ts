import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const label of ["Mounted fruit", "Unmounted fruit"]) {
    test.describe(label, () => {
      test("click activates the selected item", async ({ q }) => {
        const select = q.combobox(label);
        await select.click();

        const orange = q.option("Orange");
        await test.expect(orange).toHaveAttribute("data-active-item");
        await test
          .expect(select)
          .toHaveAttribute(
            "aria-activedescendant",
            (await orange.getAttribute("id"))!,
          );
      });

      for (const key of ["Enter", "Space", "ArrowDown", "ArrowUp"]) {
        test(`${key} activates the selected item`, async ({ page, q }) => {
          const select = q.combobox(label);
          await select.focus();
          await page.keyboard.press(key);

          const orange = q.option("Orange");
          await test.expect(orange).toHaveAttribute("data-active-item");
          await test
            .expect(select)
            .toHaveAttribute(
              "aria-activedescendant",
              (await orange.getAttribute("id"))!,
            );
        });
      }
    });
  }

  test.describe("Status", () => {
    // https://github.com/ariakit/ariakit/pull/6832#discussion_r3648996674
    test("arrow keys move through the items after clicking to open", async ({
      page,
      q,
    }) => {
      const select = q.combobox("Status");
      await select.click();

      await test.expect(q.listbox("Status")).toBeVisible();
      await test.expect(select).toBeFocused();
      await test.expect(select).not.toHaveAttribute("aria-activedescendant");

      await page.keyboard.press("ArrowDown");
      const draft = q.option("Draft");
      await test.expect(draft).toHaveAttribute("data-active-item");
      await test
        .expect(select)
        .toHaveAttribute(
          "aria-activedescendant",
          (await draft.getAttribute("id"))!,
        );

      await page.keyboard.press("ArrowDown");
      const published = q.option("Published");
      await test.expect(published).toHaveAttribute("data-active-item");
      await test
        .expect(select)
        .toHaveAttribute(
          "aria-activedescendant",
          (await published.getAttribute("id"))!,
        );
      await test.expect(draft).not.toHaveAttribute("data-active-item");

      await page.keyboard.press("Enter");
      await test.expect(published).toHaveAttribute("aria-selected", "true");
      await test.expect(select).toHaveText("Published");
    });

    // https://github.com/ariakit/ariakit/pull/6832#discussion_r3648996674
    test("arrow keys move through the items after opening with Enter", async ({
      page,
      q,
    }) => {
      const select = q.combobox("Status");
      await select.focus();
      await page.keyboard.press("Enter");

      await test.expect(q.listbox("Status")).toBeVisible();
      await test.expect(select).not.toHaveAttribute("aria-activedescendant");

      await page.keyboard.press("ArrowDown");
      await test.expect(q.option("Draft")).toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowDown");
      await test
        .expect(q.option("Published"))
        .toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowUp");
      await test.expect(q.option("Draft")).toHaveAttribute("data-active-item");
      await test.expect(select).toBeFocused();
    });
  });

  for (const label of ["No-autofocus status", "Real-focus status"]) {
    // https://github.com/ariakit/ariakit/pull/6832
    test(`${label} moves from the focused select`, async ({ page, q }) => {
      const select = q.combobox(label);
      await select.click();

      const listbox = q.listbox(`${label} options`);
      await test.expect(listbox).toBeVisible();
      await test.expect(select).toBeFocused();
      await test
        .expect(query(listbox).option("Draft"))
        .toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowDown");
      await test
        .expect(query(listbox).option("Published"))
        .toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowUp");
      await test
        .expect(query(listbox).option("Draft"))
        .toHaveAttribute("data-active-item");
    });
  }

  // https://github.com/ariakit/ariakit/pull/6832
  test("honors focusOnHover on a closed always-visible list", async ({ q }) => {
    const item = q.option("Explicit hover second");
    await item.hover();

    await test.expect(item).toHaveAttribute("data-active-item");
  });
});
