import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const labels = ["Fruit", "Fruit without virtual focus"];
const hoverLabels = ["Hover fruit", "Callback hover fruit"];

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const label of labels) {
    // https://github.com/ariakit/ariakit/issues/7093
    test(`${label}: a collapsed select never focuses its list`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      const list = q.listbox(`${label} options`);
      const focusedOptions = q.status(`${label} focused options`);

      await select.focus();

      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      // The composite can present its active item from a queued microtask or
      // from a passive effect that runs after paint, so cross those frames
      // before asserting that focus never reached the list.
      await flushFrames(page);
      await test.expect(select).toBeFocused();
      await test.expect(focusedOptions).toHaveText("none");

      await select.press("g");

      await test.expect(select).toHaveText("Grape");
      await test
        .expect(query(list).option("Grape"))
        .toHaveAttribute("data-active-item");
      // The move is committed by the assertions above, but the presentation
      // effect it schedules still runs after paint.
      await flushFrames(page);
      await test.expect(select).toBeFocused();
      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      await test.expect(focusedOptions).toHaveText("none");

      // Opening the list is what turns its items into focus targets, so this
      // also shows that the recorder fires when an item really is focused.
      await select.press("ArrowDown");

      await test.expect(select).toHaveAttribute("aria-expanded", "true");
      await test
        .expect(query(list).option("Grape"))
        .toHaveAttribute("data-active-item");
      await test.expect(focusedOptions).toHaveText("Grape");
    });
  }

  // https://github.com/ariakit/ariakit/issues/7093
  // Only virtual focus asks for the active item when the select itself is
  // focused, which happens while the list is still closed. That request is the
  // one that has to survive until the list opens, so a pointer open with no
  // move before it still presents the item.
  test("opening the collapsed select with a pointer presents its item", async ({
    q,
  }) => {
    const select = q.combobox("Fruit");
    const focusedOptions = q.status("Fruit focused options");

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(focusedOptions).toHaveText("Apple");
  });

  // https://github.com/ariakit/ariakit/issues/7093
  // Withholding focus must not also withhold the rest of the presentation: a
  // list that is already on screen still belongs at the active item.
  test("typeahead scrolls a collapsed list to the active item", async ({
    q,
  }) => {
    const select = q.combobox("Code");
    const list = q.listbox("Code options");
    const scrollTop = () => list.evaluate((element) => element.scrollTop);

    await select.focus();
    test.expect(await scrollTop()).toBe(0);

    await select.press("z");

    const zulu = q.option("Zulu");
    await test.expect(zulu).toHaveAttribute("data-active-item");
    await test.expect.poll(scrollTop).toBeGreaterThan(0);
    await test.expect(zulu).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7093
  // Focusing the collapsed select leaves a presentation waiting for the list to
  // open. Picking another option before that happens has to retire it, or
  // opening the list would present the option that was active on focus.
  test("picking an option before opening retires the pending presentation", async ({
    q,
  }) => {
    const select = q.combobox("Code");
    await select.focus();
    await q.option("Alpha 25").click();
    await test.expect(select).toHaveText("Alpha 25");

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.option("Alpha 25")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/pull/7098#discussion_r3742291859
  // Withholding belongs to the widget that owns focus. A move made from
  // outside keeps presenting immediately, so the focus it moves is
  // attributable to that call instead of landing on whoever is focused when
  // the list next opens.
  test("a move from outside the widget still presents immediately", async ({
    page,
    q,
  }) => {
    const openList = q.button("Open stage list");

    await q.button("Apply stage preset").click();

    await test.expect(q.option("Final")).toBeFocused();
    await test
      .expect(q.combobox("Stage"))
      .toHaveAttribute("aria-expanded", "false");

    await openList.click();

    await test
      .expect(q.combobox("Stage"))
      .toHaveAttribute("aria-expanded", "true");
    // Opening is observable above, but a presentation left over from the move
    // would arrive from a passive effect after paint, so cross those frames
    // before asserting that the click kept its focus.
    await flushFrames(page);
    await test.expect(openList).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7098#discussion_r3742291859
  // Once focus is on an option, moving between options is navigation inside
  // the list, not focus leaving the control, so the focus ring has to keep up
  // with the active item even though the list is collapsed.
  test("arrow keys keep moving focus between options in a collapsed list", async ({
    page,
    q,
  }) => {
    const list = q.listbox("Stage options");
    await query(list).option("Draft").click();
    await test.expect(query(list).option("Draft")).toBeFocused();
    await test
      .expect(q.combobox("Stage"))
      .toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("ArrowDown");

    const review = query(list).option("Review");
    await test.expect(review).toHaveAttribute("data-active-item");
    await test.expect(review).toBeFocused();
  });

  for (const label of hoverLabels) {
    // https://github.com/ariakit/ariakit/issues/7118
    test(`${label}: hovering an option in a collapsed list changes nothing`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      const list = q.listbox(`${label} options`);
      const grape = query(list).option("Grape");
      const other = q.button(`${label} other control`);

      await other.click();
      await test.expect(other).toBeFocused();

      await grape.hover();

      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      // Hover activation is committed inside the mousemove handler, so there
      // is no positive state to wait for. Cross the frames a presentation
      // would use to reach the item before asserting that none did.
      await flushFrames(page);
      await test.expect(grape).not.toHaveAttribute("data-active-item");
      await test.expect(other).toBeFocused();
    });

    // https://github.com/ariakit/ariakit/issues/7118
    // The gate is about the closed list, not about the authored value, so the
    // same item still takes hover once the select opens.
    test(`${label}: hovering an option activates it once the list opens`, async ({
      q,
    }) => {
      const select = q.combobox(label);
      const list = q.listbox(`${label} options`);
      const grape = query(list).option("Grape");

      await select.click();
      await test.expect(select).toHaveAttribute("aria-expanded", "true");

      await grape.hover();

      await test.expect(grape).toHaveAttribute("data-active-item");
    });
  }

  // https://github.com/ariakit/ariakit/issues/7118
  // The default predicate is part of the same contract: with no authored
  // focusOnHover, hovering an option in a collapsed list changes nothing.
  test("default hover on a collapsed list changes nothing", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Fruit");
    const list = q.listbox("Fruit options");
    const grape = query(list).option("Grape");

    await grape.hover();

    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    // Hover activation is committed inside the mousemove handler, so there
    // is no positive state to wait for. Cross the frames a presentation
    // would use to reach the item before asserting that none did.
    await flushFrames(page);
    await test.expect(grape).not.toHaveAttribute("data-active-item");
    await test.expect(q.status("Fruit focused options")).toHaveText("none");
  });

  // https://github.com/ariakit/ariakit/issues/7118
  // Without ComboboxSelect the default stays false even while the list is
  // open, so hover only activates an item when the consumer opts in.
  test("default hover in an open plain combobox activates nothing", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Filter");
    const list = q.listbox("Filter options");
    const grape = query(list).option("Grape");

    await combobox.click();
    await test.expect(combobox).toHaveAttribute("aria-expanded", "true");

    await grape.hover();

    // Hover activation is committed inside the mousemove handler, so there
    // is no positive state to wait for. Cross the frames a presentation
    // would use to reach the item before asserting that none did.
    await flushFrames(page);
    await test.expect(grape).not.toHaveAttribute("data-active-item");
    await test.expect(combobox).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7093
  test("a collapsed combobox input never focuses its list", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Filter");

    await combobox.focus();

    await test.expect(combobox).toHaveAttribute("aria-expanded", "false");
    // The composite can present its active item from a queued microtask or
    // from a passive effect that runs after paint, so cross those frames
    // before asserting that focus never reached the list.
    await flushFrames(page);
    await test.expect(combobox).toBeFocused();
    await test.expect(q.status("Filter focused options")).toHaveText("none");
  });
});
