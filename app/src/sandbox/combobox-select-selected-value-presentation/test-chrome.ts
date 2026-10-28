import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  expectInScrollport,
  expectVerticallyCentered,
} from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  const reopenFocusedSelect = async (
    select: Locator,
    reopen: "click" | "Enter" | "Space",
  ) => {
    await test.expect(select).toBeFocused();
    if (reopen === "click") {
      await select.click();
    } else {
      await select.press(reopen);
    }
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
  };

  const selectSixItemsUp = async (select: Locator, target: Locator) => {
    const page = select.page();
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("ArrowUp");
    }
    await test.expect(target).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
  };

  // Closes "Parked fruit" with its list scrolled to the top, so the selected
  // item is out of view when the focused select opens again.
  const closeParkedListAtTop = async (page: Page) => {
    const q = query(page);
    const select = q.combobox("Parked fruit");
    await select.click();
    await q.button("Finish Parked fruit positioning").click();
    await test.expect(q.listbox()).not.toHaveAttribute("data-placing");
    await page.keyboard.press("Home");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test.expect(q.listbox()).toHaveJSProperty("scrollTop", 0);
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
  };

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item when an arrow key opens the popup", async ({
    q,
  }) => {
    const select = q.combobox("Centered fruit");
    await select.focus();
    await select.press("ArrowDown");

    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), mango);
  });

  for (const storeOn of ["select", "popover"]) {
    // https://github.com/ariakit/ariakit/issues/7617
    test(`centers a new selection on reopen when only the ${storeOn} receives the store`, async ({
      page,
      q,
    }) => {
      const label =
        storeOn === "select" ? "Select-store fruit" : "Popover-store fruit";
      const select = q.combobox(label);
      const listbox = q.listbox(label);
      const mango = q.option("Mango");
      const jackfruit = q.option("Jackfruit");
      await select.click();
      await test.expect(mango).toHaveAttribute("data-active-item");
      await expectVerticallyCentered(listbox, mango);

      for (let i = 0; i < 6; i += 1) {
        await page.keyboard.press("ArrowUp");
      }
      await test.expect(jackfruit).toHaveAttribute("data-active-item");
      await page.keyboard.press("Enter");
      await test.expect(select).toHaveText("Jackfruit");
      await test.expect(listbox).not.toBeVisible();
      await test.expect(select).toBeFocused();

      await select.click();

      await test.expect(jackfruit).toHaveAttribute("data-active-item");
      await expectVerticallyCentered(listbox, jackfruit);
    });
  }

  // An arrow-key open records a non-zero move count, while a click reopen
  // starts from zero, so the reopen only centers if the close cleared the
  // earlier baseline.
  // https://github.com/ariakit/ariakit/pull/7619#discussion_r4088465011
  test("centers the selected item on a click reopen after an arrow-key open", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Centered fruit");
    const listbox = q.listbox();
    const jackfruit = q.option("Jackfruit");
    await select.focus();
    await select.press("ArrowDown");
    await test.expect(q.option("Mango")).toHaveAttribute("data-active-item");

    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("ArrowUp");
    }
    await test.expect(jackfruit).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveText("Jackfruit");
    await test.expect(listbox).not.toBeVisible();

    await select.click();

    await test.expect(jackfruit).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(listbox, jackfruit);
  });

  // https://github.com/ariakit/ariakit/pull/7619#discussion_r4088440311
  test("centers the selected item when the select element is replaced on open", async ({
    q,
  }) => {
    await q.combobox("Swapping fruit").click();

    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox("Swapping fruit"), mango);
  });

  test("does not re-render inactive items when the popup opens", async ({
    page,
    q,
  }) => {
    const item = page.locator("[data-render-count]");
    // Mounting renders the item twice: once on its own, then again when the
    // composite element is published. Assert the settled count before opening
    // so an actual render on open still moves it to three.
    // https://github.com/ariakit/ariakit/issues/7184
    await test.expect(item).toHaveAttribute("data-render-count", "2");

    await q.combobox("Render-counted fruit").click();
    await test.expect(q.listbox("Render-counted fruit")).toBeVisible();
    // The open still commits on the next frames, and the absence of an item
    // render has no positive state to await, so give a stray render a chance to
    // appear before asserting it never happened.
    await flushFrames(page);

    await test.expect(item).toHaveAttribute("data-render-count", "2");
  });

  test("keeps external focus when opening after a closed move", async ({
    page,
    q,
  }) => {
    await q.button("Move programmatic fruit").click();
    const open = q.button("Open programmatic fruit");
    await open.click();

    await test.expect(q.listbox("Programmatic fruit")).toBeVisible();
    // The presentation created by the open has no positive completion marker,
    // so cross its frame checkpoint before confirming focus stayed outside.
    await flushFrames(page);
    await test.expect(open).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item when the popup remounts", async ({ q }) => {
    const select = q.combobox("Centered unmounted fruit");
    const mango = q.option("Mango");

    await select.click();
    await expectVerticallyCentered(q.listbox(), mango);
    await select.press("Escape");
    await test.expect(q.listbox()).not.toBeVisible();
    await select.click();

    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), mango);
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("focuses a dialog after its store changes", async ({ q }) => {
    const focusHistory = q.status("Store swap focus history");

    await test.expect(focusHistory).toHaveText("none");

    await q.button("Open store A").click();
    await test.expect(q.textbox("Store A initial focus")).toBeFocused();

    await q.button("Open store B").click();

    await test.expect(q.textbox("Store B initial focus")).toBeFocused();
    await test
      .expect(focusHistory)
      .toHaveText(
        "open store A → store A input → open store B → store B input",
      );
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("uses the current disclosure in delayed auto-focus", async ({
    page,
    q,
  }) => {
    const previousDisclosure = q.button("Open disclosure swap dialog");
    const focusHistory = q.status("Disclosure swap focus history");

    await test.expect(focusHistory).toHaveText("none");

    await previousDisclosure.click();

    await test.expect(previousDisclosure).toBeFocused();
    // Dialog's queued auto-focus has no observable completion marker, so cross
    // its frame checkpoint before asserting that focus remained outside.
    await flushFrames(page);
    await test.expect(previousDisclosure).toBeFocused();
    await test.expect(focusHistory).toHaveText("input → previous disclosure");
  });

  // This case originated in the unmerged PR below. It covers the same
  // focus-move cancellation invariant when the popup remounts on open and the
  // select element briefly becomes the composite again.
  // https://github.com/ariakit/ariakit/pull/6994
  test("cancels presentation when real focus moves in an unmounted popup", async ({
    page,
    q,
  }) => {
    await q.combobox("Focus moving unmounted fruit").click();

    await test.expect(q.option("Focus target")).toBeFocused();
    // Focus has moved before the pending presentation callback can run. There
    // is no positive state for its cancellation, so wait through its
    // checkpoint.
    await flushFrames(page);
    await test.expect(q.option("Focus target")).toBeInViewport();
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });

  // The control for the remounting case below: with the popup's own initial
  // focus off, the presentation is the only thing that brings the item into
  // view, so this fails for any reason that stops the presentation at all.
  // https://github.com/ariakit/ariakit/issues/7021
  test("presents a far selected item without the popup's initial focus", async ({
    q,
  }) => {
    const select = q.combobox("Persisting fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // The select keeps focus while its popup is closed, so reopening it fires no
  // focus event, and the popup's own initial focus is off. The selection sits
  // at the edge of the list the popup left behind.
  for (const reopen of ["click", "Enter", "Space"] as const) {
    // https://github.com/ariakit/ariakit/issues/7620
    test(`centers a new selection when ${reopen} reopens a popup without initial focus`, async ({
      q,
    }) => {
      const select = q.combobox("Persisting fruit");
      const pineapple = q.option("Pineapple");
      await select.click();
      await expectVerticallyCentered(q.listbox(), q.option("Watermelon"));
      await selectSixItemsUp(select, pineapple);
      await test.expect(select).toHaveText("Pineapple");

      await reopenFocusedSelect(select, reopen);

      await test.expect(pineapple).toHaveAttribute("data-active-item");
      await expectVerticallyCentered(q.listbox(), pineapple);
      await test.expect(select).toBeFocused();
    });
  }

  // https://github.com/ariakit/ariakit/issues/7620
  test("centers the selected item when a popup without initial focus reopens after Escape", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Persisting fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await expectVerticallyCentered(q.listbox(), watermelon);
    await page.keyboard.press("Home");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test.expect(watermelon).not.toBeInViewport();
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");

    // A click leaves no key event for the select to forward to the active item,
    // and forwarding one would focus the item and present it along the way.
    await reopenFocusedSelect(select, "click");

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), watermelon);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7620
  test("centers a new selection when a select sharing the popup store reopens", async ({
    q,
  }) => {
    const select = q.combobox("Programmatic fruit");
    const jackfruit = q.option("Jackfruit");
    await select.click();
    await expectVerticallyCentered(q.listbox(), q.option("Mango"));
    await selectSixItemsUp(select, jackfruit);
    await test.expect(select).toHaveText("Jackfruit");

    await reopenFocusedSelect(select, "click");

    await test.expect(jackfruit).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), jackfruit);
    await test.expect(select).toBeFocused();
  });

  // The select and the items read different store objects here, as in the
  // provider-store selects above.
  for (const storeOn of ["select", "popover"]) {
    // https://github.com/ariakit/ariakit/issues/7620
    test(`centers a new selection when a popup without initial focus reopens and only the ${storeOn} receives the store`, async ({
      q,
    }) => {
      const label =
        storeOn === "select"
          ? "Select-store persisting fruit"
          : "Popover-store persisting fruit";
      const select = q.combobox(label);
      const jackfruit = q.option("Jackfruit");
      await select.click();
      await expectVerticallyCentered(q.listbox(), q.option("Mango"));
      await selectSixItemsUp(select, jackfruit);
      await test.expect(select).toHaveText("Jackfruit");

      await reopenFocusedSelect(select, "click");

      await test.expect(jackfruit).toHaveAttribute("data-active-item");
      await expectVerticallyCentered(q.listbox(), jackfruit);
      await test.expect(select).toBeFocused();
    });
  }

  // https://github.com/ariakit/ariakit/issues/7620
  test("centers the selected item when a filterable popup without initial focus opens", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Filterable persisting fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), watermelon);
    await test.expect(select).toBeFocused();

    await q.listbox().hover();
    await page.mouse.wheel(0, -2000);
    await test.expect(watermelon).not.toBeInViewport();
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");

    await reopenFocusedSelect(select, "click");

    await expectVerticallyCentered(q.listbox(), watermelon);
    await test.expect(select).toBeFocused();
  });

  // Centering is for opens that the select drives, so an open from elsewhere
  // leaves the list where it was.
  // https://github.com/ariakit/ariakit/issues/7620
  test("does not center the selected item when a popup without initial focus opens while focus is elsewhere", async ({
    q,
  }) => {
    const open = q.button("Open programmatic fruit");
    await open.click();

    const listbox = q.listbox("Programmatic fruit");
    await test.expect(listbox).toBeVisible();
    // Presentations scroll on the store update that ends placement, before
    // `data-placing` goes away, so the position below is already settled.
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    await test.expect(listbox).toHaveJSProperty("scrollTop", 0);
    await test.expect(open).toBeFocused();
  });

  // A move made while the popup is positioning presents its own target, so the
  // open must not scroll toward the selected item before it. Apricot is visible
  // but not first, so a stray scroll can't be undone by the move's own one.
  // https://github.com/ariakit/ariakit/issues/7620
  test("keeps the list in place when a move is made while a reopened popup is positioning", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Parked fruit");
    const finish = q.button("Finish Parked fruit positioning");
    const listbox = q.listbox();
    await closeParkedListAtTop(page);

    await reopenFocusedSelect(select, "click");
    await test.expect(listbox).toHaveAttribute("data-placing");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apricot")).toHaveAttribute("data-active-item");
    await finish.click();

    // Presentations scroll on the store update that ends placement, before
    // `data-placing` goes away, so the position below is already settled.
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    await test.expect(listbox).toHaveJSProperty("scrollTop", 0);
    await test.expect(select).toBeFocused();
  });

  // A move must not start the open's presentation again either. Moving back to
  // the selected item would give it a target, and the highlight that follows
  // isn't a move, so it wouldn't end it before placement does.
  // https://github.com/ariakit/ariakit/issues/7620
  test("keeps the list in place when a highlight follows moves while a reopened popup is positioning", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Parked fruit");
    const finish = q.button("Finish Parked fruit positioning");
    const listbox = q.listbox();
    const apple = q.option("Apple");
    await closeParkedListAtTop(page);

    await reopenFocusedSelect(select, "click");
    await test.expect(listbox).toHaveAttribute("data-placing");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Watermelon"))
      .toHaveAttribute("data-active-item");
    // Highlights Apple without a move.
    await q.button("Refresh Parked fruit list").click();
    await test.expect(apple).toHaveAttribute("data-active-item");
    await finish.click();

    // Presentations scroll on the store update that ends placement, before
    // `data-placing` goes away, so the position below is already settled.
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    await test.expect(listbox).toHaveJSProperty("scrollTop", 0);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7620
  test("centers a new selection when an unmounted popup without initial focus reopens", async ({
    q,
  }) => {
    const select = q.combobox("Unmounting fruit");
    const pineapple = q.option("Pineapple");
    await select.click();
    await expectVerticallyCentered(q.listbox(), q.option("Watermelon"));
    await selectSixItemsUp(select, pineapple);
    await test.expect(select).toHaveText("Pineapple");

    await reopenFocusedSelect(select, "click");

    await test.expect(pineapple).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), pineapple);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7021
  test("presents a far selected item replaced under a stable id", async ({
    q,
  }) => {
    const select = q.combobox("Remounting fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    // The explicit id is the premise: a replaced item that came back under a
    // generated one would be a different logical item, which is a different
    // reason to drop the presentation and not the one this covers.
    await test
      .expect(watermelon)
      .toHaveAttribute("id", "remounting-watermelon");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // A request that resolved an item keeps presenting that one, even when the
  // active item moves on before the replacement lands. Highlighting sets the
  // active id without bumping `moves`, so nothing abandons the request, and the
  // newly highlighted item is not a presentation target.
  // https://github.com/ariakit/ariakit/pull/7030
  test("keeps presenting the item it resolved when the active item moves on", async ({
    q,
  }) => {
    const select = q.combobox("Parked fruit");
    const watermelon = q.option("Watermelon");
    const apple = q.option("Apple");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    // Positioning is held, so the presentation the open scheduled is parked and
    // has already resolved `Watermelon`.
    await test.expect(q.listbox()).toHaveAttribute("data-placing");
    await test.expect(watermelon).toHaveAttribute("id", "parked-watermelon");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    // Marks the node the request resolved, so the replacement below is
    // observable: a node that comes back without the mark is a different one.
    await watermelon.evaluate((node) => node.setAttribute("data-resolved", ""));

    // One action highlights another item and replaces every item node under the
    // same ids, which is the state the request has to resolve again from.
    await q.button("Refresh Parked fruit list").click();
    await test.expect(apple).toHaveAttribute("data-active-item");
    await test.expect(watermelon).not.toHaveAttribute("data-active-item");
    // The replacement is the premise: the request only resolves again once the
    // node it cached has left the DOM.
    await test.expect(watermelon).not.toHaveAttribute("data-resolved");
    await test.expect(watermelon).toHaveAttribute("id", "parked-watermelon");

    await q.button("Finish Parked fruit positioning").click();

    await expectInScrollport(q.listbox(), watermelon);
  });
});
