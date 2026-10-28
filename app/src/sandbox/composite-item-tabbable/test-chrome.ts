import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7364
  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3902850820
  test("moves to an accessible disabled item inherited through composition", async ({
    page,
    q,
  }) => {
    await q.option("Inherited one").click();
    await test.expect(q.option("Inherited one")).toBeFocused();

    const accessibleDisabledItem = q.option("Inherited two");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("aria-disabled", "true");
    await test.expect(accessibleDisabledItem).not.toHaveAttribute("disabled");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("data-truly-disabled", "false");

    await page.keyboard.press("ArrowRight");
    await test.expect(accessibleDisabledItem).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7384
  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3902850820
  test("moves to an accessible disabled item resolved below it", async ({
    page,
    q,
  }) => {
    await q.option("Rendered one").click();
    const accessibleDisabledItem = q.option("Rendered two");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("aria-disabled", "true");
    await test.expect(accessibleDisabledItem).not.toHaveAttribute("disabled");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("data-truly-disabled", "false");
    await page.keyboard.press("ArrowRight");
    await test.expect(accessibleDisabledItem).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3901879752
  test("skips a disabled item resolved below it", async ({ page, q }) => {
    await q.option("Nested one").click();
    await test.expect(q.option("Nested two")).toHaveAttribute("disabled", "");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.option("Nested three")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3900826323
  test("skips a disabled item with an inactive Focusable", async ({
    page,
    q,
  }) => {
    await q.option("Inactive one").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.option("Inactive three")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3901879752
  test("skips a disabled item with an inactive Focusable below it", async ({
    page,
    q,
  }) => {
    await q.option("Rendered inactive one").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.option("Rendered inactive three")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3904362936
  test("moves to an accessible disabled item with an active Focusable below it", async ({
    page,
    q,
  }) => {
    await q.option("Rendered active one").click();
    const accessibleDisabledItem = q.option("Rendered active two");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("data-truly-disabled", "false");
    await page.keyboard.press("ArrowRight");
    await test.expect(accessibleDisabledItem).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3902849677
  test("skips a directly disabled item with an inactive accessible Focusable", async ({
    page,
    q,
  }) => {
    await q.option("Direct accessible inactive one").click();
    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.option("Direct accessible inactive three"))
      .toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3902849677
  test("skips an inherited disabled item with an inactive accessible Focusable", async ({
    page,
    q,
  }) => {
    await q.option("Inherited accessible inactive one").click();
    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.option("Inherited accessible inactive three"))
      .toBeFocused();
  });

  test("keeps a single tab stop per composite once hydrated", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.option("Starred")).toBeFocused();

    // The containerless store never gets a composite element, so its items must
    // keep roving tabindex and skip straight to the next widget.
    await page.keyboard.press("Tab");
    await test.expect(q.listbox("Virtual focus")).toBeFocused();

    // Virtual focus options are never tab stops, so each composite element is
    // the only stop until the roving item at the end.
    await page.keyboard.press("Tab");
    await test.expect(q.listbox("Seeded")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.option("Spam")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/4767
  test("does not redirect focus to a non-focusable virtual focus owner", async ({
    page,
    q,
  }) => {
    const primary = q.option("Primary");
    await primary.click();
    await test.expect(primary).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const social = q.option("Social");
    await test.expect(social).toBeFocused();
    await test.expect(social).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");
    const updates = q.option("Updates");
    await test.expect(updates).toBeFocused();
    await test.expect(updates).toHaveAttribute("data-focus-visible", "true");
    await test.expect(primary).not.toHaveAttribute("data-focus-visible");
    await test.expect(social).not.toHaveAttribute("data-focus-visible");
  });
});
