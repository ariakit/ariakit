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
      .not.toHaveAttribute("data-truly-disabled");

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
      .not.toHaveAttribute("data-truly-disabled");
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
      .toHaveAttribute("data-focusable-accessible-when-disabled", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(accessibleDisabledItem).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3902848381
  test("skips a disabled item with a consumer false attribute", async ({
    page,
    q,
  }) => {
    await q.option("Styled one").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.option("Styled three")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3904009762
  test("moves to an accessible disabled item with a consumer true attribute", async ({
    page,
    q,
  }) => {
    await q.option("Styled accessible one").click();
    const accessibleDisabledItem = q.option("Styled accessible two");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("data-truly-disabled", "true");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("data-focusable-accessible-when-disabled", "true");
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
});
