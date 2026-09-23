import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

  test.describe("Vegetable", () => {
    const moves = [
      { name: "Typeahead", key: "c", item: "Carrot" },
      { name: "ArrowDown", key: "ArrowDown", item: "Broccoli" },
    ];

    for (const { name, key, item } of moves) {
      // https://github.com/ariakit/ariakit/issues/7612
      test(`${name} move made while the popup is positioning stays active`, async ({
        page,
        q,
      }) => {
        const select = q.combobox("Vegetable");
        await select.click();

        // Positioning is held, so the popup hasn't taken its initial focus.
        const listbox = q.listbox("Vegetable");
        await test.expect(listbox).toHaveAttribute("data-placing");
        await test
          .expect(query(listbox).option("Artichoke"))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press(key);
        const target = query(listbox).option(item);
        await test.expect(target).toHaveAttribute("data-active-item");

        await q.button("Finish vegetable positioning").click();
        await test.expect(listbox).not.toHaveAttribute("data-placing");
        // Dialog queues auto-focus after placement, and there is no positive
        // state for the active item staying put once that microtask has run.
        await flushFrames(page);
        await test.expect(select).toBeFocused();
        await test.expect(target).toHaveAttribute("data-active-item");
        await test
          .expect(select)
          .toHaveAttribute(
            "aria-activedescendant",
            (await target.getAttribute("id"))!,
          );
      });

      // https://github.com/ariakit/ariakit/issues/7612
      test(`${name} move made while the real-focus popup is positioning keeps focus`, async ({
        page,
        q,
      }) => {
        await q.combobox("Real-focus vegetable").click();

        const listbox = q.listbox("Real-focus vegetable");
        await test.expect(listbox).toHaveAttribute("data-placing");

        await page.keyboard.press(key);
        const target = query(listbox).option(item);
        await test.expect(target).toBeFocused();

        await q.button("Finish real-focus vegetable positioning").click();
        await test.expect(listbox).not.toHaveAttribute("data-placing");
        // Dialog queues auto-focus after placement, and there is no positive
        // state for focus staying put once that microtask has run.
        await flushFrames(page);
        await test.expect(target).toBeFocused();
        await test.expect(target).toHaveAttribute("data-active-item");
      });
    }

    // https://github.com/ariakit/ariakit/issues/7612
    test("move made before the popup repositions stays active", async ({
      page,
      q,
    }) => {
      const select = q.combobox("Vegetable");
      await select.click();

      const listbox = q.listbox("Vegetable");
      await q.button("Finish vegetable positioning").click();
      await test.expect(listbox).not.toHaveAttribute("data-placing");
      // Lets the initial auto-focus run before the move, so the move below
      // happens after the popup is placed. No state marks that microtask.
      await flushFrames(page);
      await test
        .expect(query(listbox).option("Artichoke"))
        .toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowDown");
      const broccoli = query(listbox).option("Broccoli");
      await test.expect(broccoli).toHaveAttribute("data-active-item");

      await q.button("Reposition vegetable popup").click();
      await test.expect(listbox).toHaveAttribute("data-placing");

      await q.button("Finish vegetable positioning").click();
      await test.expect(listbox).not.toHaveAttribute("data-placing");
      // Dialog queues auto-focus after placement, and there is no positive
      // state for the active item staying put once that microtask has run.
      await flushFrames(page);
      await test.expect(select).toBeFocused();
      await test.expect(broccoli).toHaveAttribute("data-active-item");
    });
  });

  // https://github.com/ariakit/ariakit/issues/7612
  test("Managed vegetable popup focuses its autoFocus element when the user doesn't move", async ({
    q,
  }) => {
    const select = q.combobox("Managed vegetable");
    await select.click();

    const listbox = q.listbox("Managed vegetable");
    await test.expect(listbox).toHaveAttribute("data-placing");
    await test.expect(select).toBeFocused();

    await q.button("Finish managed vegetable positioning").click();
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    await test.expect(query(listbox).button("Manage vegetables")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7614#discussion_r4082271058
  test("Store-prop vegetable move made while the popup is positioning stays active", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Store-prop vegetable");
    await select.click();

    const listbox = q.listbox("Store-prop vegetable");
    await test.expect(listbox).toHaveAttribute("data-placing");

    await page.keyboard.press("c");
    const carrot = query(listbox).option("Carrot");
    await test.expect(carrot).toHaveAttribute("data-active-item");

    await q.button("Finish store-prop vegetable positioning").click();
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    // Dialog queues auto-focus after placement, and there is no positive state
    // for the active item staying put once that microtask has run.
    await flushFrames(page);
    await test.expect(select).toBeFocused();
    await test.expect(carrot).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/7612
  test("Unmounted vegetable move made while the popup is positioning stays active", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Unmounted vegetable");
    await select.click();

    // The popup mounts only once it opens, so this also covers a popover that
    // starts tracking movement after the popup is already open.
    const listbox = q.listbox("Unmounted vegetable");
    await test.expect(listbox).toHaveAttribute("data-placing");

    await page.keyboard.press("c");
    const carrot = query(listbox).option("Carrot");
    await test.expect(carrot).toHaveAttribute("data-active-item");

    await q.button("Finish unmounted vegetable positioning").click();
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    // Dialog queues auto-focus after placement, and there is no positive state
    // for the active item staying put once that microtask has run.
    await flushFrames(page);
    await test.expect(select).toBeFocused();
    await test.expect(carrot).toHaveAttribute("data-active-item");
  });
});
