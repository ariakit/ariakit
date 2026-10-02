import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  expectVerticallyCentered,
  recordScrollEvents,
} from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  const expectInScrollport = async (listbox: Locator, item: Locator) => {
    await test
      .expect(async () => {
        const itemBox = await item.boundingBox();
        test.expect(itemBox).not.toBeNull();
        const edges = await listbox.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: rect.top + element.clientTop + element.clientHeight,
            top: rect.top + element.clientTop,
          };
        });
        test.expect(itemBox!.y).toBeGreaterThanOrEqual(edges.top);
        test
          .expect(itemBox!.y + itemBox!.height)
          .toBeLessThanOrEqual(edges.bottom);
      })
      .toPass();
  };

  const expectAtScrollportBottom = async (listbox: Locator, item: Locator) => {
    await test
      .expect(async () => {
        const itemBox = await item.boundingBox();
        test.expect(itemBox).not.toBeNull();
        const listboxBottom = await listbox.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top + element.clientTop + element.clientHeight;
        });
        const itemBottom = itemBox!.y + itemBox!.height;
        test.expect(itemBottom).toBeCloseTo(listboxBottom, 0);
      })
      .toPass();
  };

  const expectHorizontallyVisible = async (
    scrollport: Locator,
    item: Locator,
  ) => {
    await test
      .expect(async () => {
        const itemBox = await item.boundingBox();
        test.expect(itemBox).not.toBeNull();
        const edges = await scrollport.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left + element.clientLeft,
            right: rect.left + element.clientLeft + element.clientWidth,
          };
        });
        test.expect(itemBox!.x).toBeGreaterThanOrEqual(edges.left);
        test
          .expect(itemBox!.x + itemBox!.width)
          .toBeLessThanOrEqual(edges.right);
      })
      .toPass();
  };

  const expectAtInlineStart = async (scrollport: Locator, item: Locator) => {
    await test
      .expect(async () => {
        const itemBox = await item.boundingBox();
        test.expect(itemBox).not.toBeNull();
        const edges = await scrollport.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            direction: getComputedStyle(element).direction,
            left: rect.left + element.clientLeft,
            right: rect.left + element.clientLeft + element.clientWidth,
          };
        });
        if (edges.direction === "rtl") {
          test.expect(itemBox!.x + itemBox!.width).toBeCloseTo(edges.right, 0);
        } else {
          test.expect(itemBox!.x).toBeCloseTo(edges.left, 0);
        }
      })
      .toPass();
  };

  // https://github.com/ariakit/ariakit/pull/6832
  test("focuses a far item reached through typeahead", async ({ page, q }) => {
    const select = q.combobox("Selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    const apple = q.option("Apple");
    const lychee = q.option("Lychee");
    // A runner stall of over 500ms between "l" and "y" splits the typeahead
    // query and leaves Lemon active. Home restarts from Apple with an empty
    // query, so a retry can't reach Lychee by cycling through the "l" items.
    // https://github.com/ariakit/ariakit/issues/7610
    await test
      .expect(async () => {
        await page.keyboard.press("Home");
        await test.expect(apple).toHaveAttribute("data-active-item");
        await page.keyboard.type("ly");
        await test.expect(lychee).toHaveAttribute("data-active-item");
      })
      .toPass();
    await test.expect(lychee).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  test("reopening presents a far selected item", async ({ page, q }) => {
    const select = q.combobox("Single selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");

    const watermelon = q.option("Watermelon");
    await page.keyboard.press("w");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveText("Watermelon");
    await test.expect(q.listbox()).not.toBeVisible();
    await select.click();

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), watermelon);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item only on open", async ({ page, q }) => {
    const select = q.combobox("Centered fruit");
    const mango = q.option("Mango");
    const watermelon = q.option("Watermelon");
    await select.scrollIntoViewIfNeeded();
    await test.expect(select).toBeInViewport({ ratio: 1 });
    const scrollY = await page.evaluate(() => window.scrollY);
    const scroll = await recordScrollEvents(page);

    await select.click();

    const listbox = q.listbox();
    await test.expect(mango).toHaveAttribute("data-active-item");
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    await expectVerticallyCentered(listbox, mango);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");

    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("ArrowUp");
    }
    await test
      .expect(q.option("Jackfruit"))
      .toHaveAttribute("data-active-item");
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("ArrowDown");
    }
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectAtScrollportBottom(listbox, mango);

    await page.keyboard.press("w");

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await expectAtScrollportBottom(listbox, watermelon);

    await page.keyboard.press("Escape");
    await test.expect(listbox).not.toBeVisible();
    await select.press("Enter");
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(listbox, mango);
  });

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

  test("keeps a late-mounted selected item nearest-edge aligned", async ({
    page,
    q,
  }) => {
    await q.combobox("Virtualized fruit").click();
    const listbox = q.listbox("Virtualized fruit");
    await page.keyboard.press("End");
    const watermelon = q.option("Watermelon");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await expectAtScrollportBottom(listbox, watermelon);
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

  test("keeps the centered item visible across both axes", async ({ q }) => {
    await q.combobox("Two-axis fruit").click();

    const listbox = q.listbox("Two-axis fruit");
    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(listbox, mango);
    await expectHorizontallyVisible(listbox, mango);
  });

  test("keeps the selected item visible through an inline scrollport", async ({
    q,
  }) => {
    await q.combobox("Nested-inline fruit").click();

    const listbox = q.listbox("Nested-inline fruit");
    const popover = listbox.locator("..");
    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectHorizontallyVisible(popover, mango);
  });

  for (const direction of ["LTR", "RTL"] as const) {
    test(`keeps the start of an oversized ${direction} item visible`, async ({
      q,
    }) => {
      const label = `Oversized ${direction} fruit`;
      await q.combobox(label).click();

      const listbox = q.listbox(label);
      const mango = q.option("Mango");
      await test.expect(mango).toHaveAttribute("data-active-item");
      await expectVerticallyCentered(listbox, mango);
      await expectAtInlineStart(listbox, mango);
    });
  }

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item in a nested list scrollport", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Nested-list centered fruit");
    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    const scroll = await recordScrollEvents(page);

    await select.click();

    const listbox = q.listbox("Nested-list centered fruit");
    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(listbox, mango);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("keeps the selected item visible through nested scrollports", async ({
    q,
  }) => {
    await q.combobox("Nested-scrollports fruit").click();

    const listbox = q.listbox("Nested-scrollports fruit");
    const popover = listbox.locator("..");
    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectInScrollport(listbox, mango);
    await expectInScrollport(popover, mango);
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("falls back to the page scrollport when the popup cannot scroll", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Page-scroll fruit");
    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);

    await select.click();

    const watermelon = q.option("Watermelon");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    test
      .expect(await page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollY);
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item with input-backed real focus", async ({
    q,
  }) => {
    await q.combobox("Centered filterable fruit").click();

    const listbox = q.listbox();
    const mango = q.option("Mango");
    await test
      .expect(q.combobox("Search Centered filterable fruit"))
      .toBeFocused();
    await expectVerticallyCentered(listbox, mango);
  });

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item with roving tabindex", async ({ q }) => {
    await q.combobox("Roving centered fruit").click();

    const mango = q.option("Mango");
    await test.expect(mango).toBeFocused();
    await expectVerticallyCentered(q.listbox(), mango);
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

  // https://github.com/ariakit/ariakit/issues/7011
  test("centers the selected item in a scaled popup", async ({ q }) => {
    await q.combobox("Scaled centered fruit").click();

    const listbox = q.listbox();
    const mango = q.option("Mango");
    await test.expect(mango).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(listbox, mango);
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("presents a far selected item with real focus", async ({ page, q }) => {
    const select = q.combobox("Filterable fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.listbox()).not.toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);

    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    await test.expect(watermelon).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("cancels presentation when real focus moves", async ({ page, q }) => {
    await q.combobox("Focus moving filterable fruit").click();

    await test.expect(q.option("Focus target")).toBeFocused();
    // Focus has moved before the pending presentation callback can run. There
    // is no positive state for its cancellation, so wait through its
    // checkpoint.
    await flushFrames(page);
    await test.expect(q.option("Focus target")).toBeInViewport();
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("cancels presentation when virtual focus leaves the popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Escaping fruit");
    const escapeTarget = q.button("Escaping fruit focus target");

    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
    // Clicking a select that isn't fully visible would scroll the page to reach
    // it, and that scroll would land inside the measurement below.
    await test.expect(select).toBeInViewport({ ratio: 1 });
    const scroll = await recordScrollEvents(page);

    await select.click();

    // Focus left the popup while it was still being positioned, so nothing may
    // pull it back and nothing may move the page on the way out. There is no
    // positive state for the pending presentation being abandoned, so wait
    // through its checkpoint before confirming focus stayed put.
    await test.expect(escapeTarget).toBeFocused();
    await flushFrames(page);
    await test.expect(escapeTarget).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7020
  test("cancels the item handoff presentation when focus leaves an open popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Page escaping fruit");
    const escapeTarget = q.button("Page escaping fruit focus target");

    // Clicking a select that isn't fully visible would scroll the page to reach
    // it, and that scroll would land inside the measurement below.
    await select.scrollIntoViewIfNeeded();
    await test.expect(select).toBeInViewport({ ratio: 1 });
    const scrollY = await page.evaluate(() => window.scrollY);
    const scroll = await recordScrollEvents(page);

    await select.click();

    // The popup stays open, so the presentation the item handoff scheduled is
    // only abandoned if it sees the escape.
    await test.expect(escapeTarget).toBeFocused();
    // Placement is the gate a surviving request parks behind, so pin it rather
    // than trusting a frame flush to have covered it.
    await test.expect(q.listbox()).not.toHaveAttribute("data-placing");
    await test.expect(escapeTarget).toBeFocused();
    // The popup is still open and the marked item is still the active one, so
    // none of the three abandon reasons the request already honours can be what
    // stopped it.
    await test.expect(q.listbox()).toBeVisible();
    await test
      .expect(q.option("Watermelon"))
      .toHaveAttribute("data-active-item");
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
    // And the marked item is still out of view, so the page really was the only
    // thing a surviving presentation could have scrolled.
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("does not refocus after focus leaves an open popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Focus escaping fruit");
    const escapeTarget = q.button("Focus escaping fruit focus target");
    const focusHistory = q.status("Focus escaping fruit focus history");

    await test.expect(focusHistory).toHaveText("none");

    await select.click();

    // The app moved focus out of the popup while it was opening.
    await test.expect(escapeTarget).toBeFocused();
    await test.expect(q.listbox()).not.toHaveAttribute("data-placing");
    // Dialog queues auto-focus after placement, and there is no positive state
    // for focus not being stolen once that microtask has run.
    await flushFrames(page);
    await test.expect(escapeTarget).toBeFocused();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(focusHistory).toHaveText("input → focus target");
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("does not refocus an external focus trap", async ({ page, q }) => {
    const select = q.combobox("Focus trap escaping fruit");
    const escapeTarget = q.button("Focus trap escaping fruit focus target");
    const focusHistory = q.status("Focus trap escaping fruit focus history");

    await test.expect(focusHistory).toHaveText("none");

    await select.click();

    await test.expect(escapeTarget).toBeFocused();
    await test.expect(q.listbox()).not.toHaveAttribute("data-placing");
    // Dialog queues auto-focus after placement, and there is no positive state
    // for focus not being stolen once that microtask has run.
    await flushFrames(page);
    await test.expect(escapeTarget).toBeFocused();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(focusHistory).toHaveText("input → focus target");
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("does not refocus after native auto-focus moves focus into a shadow root", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Native auto-focus dialog");
    const escapeTarget = q.textbox("Native auto-focus shadow target");
    const focusHistory = q.status("Native auto-focus history");

    await test.expect(focusHistory).toHaveText("none");
    await test.expect(escapeTarget).toBeVisible();

    await disclosure.click();

    // React runs native auto-focus before layout effects. The input's focus
    // handler moves focus out synchronously, before Dialog can install a DOM
    // listener to observe that the dialog had already received focus.
    await test.expect(escapeTarget).toBeFocused();
    // Dialog's queued auto-focus has no observable completion marker, so cross
    // its frame checkpoint before asserting that focus remained outside.
    await flushFrames(page);
    await test.expect(escapeTarget).toBeFocused();
    await test.expect(focusHistory).toHaveText("input → shadow target");
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("honors initial focus when the dialog is inside a shadow root", async ({
    q,
  }) => {
    const focusHistory = q.status("Shadow-root dialog focus history");
    const disclosure = q.button("Open shadow-root focus dialog");

    await test.expect(focusHistory).toHaveText("none");
    await test.expect(disclosure).toBeEnabled();

    await disclosure.click();

    await test
      .expect(q.textbox("Shadow-root initial focus field"))
      .toBeFocused();
    await test.expect(q.dialog("Shadow-root focus dialog")).toBeVisible();
    await test.expect(focusHistory).toHaveText("app focus → initial focus");
  });

  // https://github.com/ariakit/ariakit/issues/7033
  test("honors initial focus after focus enters a contained iframe", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Initial focus frame']"),
    );
    const focusHistory = q.status("Iframe dialog focus history");
    const disclosure = q.button("Open iframe focus dialog");

    await test.expect(focusHistory).toHaveText("none");
    await test.expect(disclosure).toBeEnabled();

    await disclosure.click();

    await test.expect(q.textbox("Iframe initial focus field")).toBeFocused();
    await test.expect(q.dialog("Iframe focus dialog")).toBeVisible();
    await test.expect(frame.textbox("Iframe app focus field")).toBeVisible();
    await test
      .expect(focusHistory)
      .toHaveText("dialog focus → iframe focus → initial focus");
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
