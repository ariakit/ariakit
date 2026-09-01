import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("does not refocus a late item after focus leaves the composite", async ({
    page,
    q,
  }) => {
    await q.button("First").focus();
    await page.keyboard.press("ArrowDown");
    const mount = q.button("Mount late items");
    await mount.click();

    await test.expect(mount).toBeFocused();
    await test.expect(q.button("Late")).not.toBeFocused();
  });

  test("only focuses the latest item after rapid unresolved moves", async ({
    page,
    q,
  }) => {
    await q.button("First").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    await q.button("Mount late items").evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });

    await test.expect(q.button("Late")).not.toBeFocused();
    await test.expect(q.button("Later")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("does not present an unresolved generic item", async ({ page, q }) => {
    const composite = q.listbox("Scroll actions");
    await composite.focus();
    const mount = q.button("Mount late scroll item");
    await mount.click();
    await test.expect(mount).toBeFocused();
    await test.expect(q.option("Late scroll item")).toBeVisible();
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );

    test
      .expect(await composite.evaluate((element) => element.scrollTop))
      .toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("does not refocus a late item after focus leaves a virtual focus composite", async ({
    q,
  }) => {
    const composite = q.listbox("Virtual actions");
    await composite.focus();
    await test.expect(composite).toBeFocused();

    const mount = q.button("Mount virtual late item");
    await mount.click();

    await test.expect(q.option("Virtual late item")).toBeVisible();
    await test.expect(mount).toBeFocused();
    await test.expect(q.listbox("Virtual actions")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("presents a rendered generic autofocus item", async ({ q }) => {
    const composite = q.listbox("Autofocus scroll actions");
    await q.button("Mount late items").focus();
    await composite.evaluate((element) => {
      element.scrollTop = 0;
    });
    test
      .expect(await composite.evaluate((element) => element.scrollTop))
      .toBe(0);

    await composite.focus();

    await test
      .expect(q.option("Autofocus scroll item"))
      .toHaveAttribute("data-active-item");
    await test.expect
      .poll(() => composite.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect(composite).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect a pending item move to the composite", async ({
    q,
  }) => {
    await q.button("Focus unavailable action").click();
    await q.button("Target pending toolbar").click();
    await q.button("Hide pending toolbar").click();
    await q.button("Show pending toolbar").click();

    await test.expect(q.button("Hide pending toolbar")).toBeFocused();
    await test.expect(q.toolbar("Pending actions")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect a pending composite move to an item", async ({
    page,
    q,
  }) => {
    await q.button("Hide pending toolbar").click();
    await q.button("Focus pending toolbar").click();
    await q.button("Target bold action").click();
    await q.button("Show pending toolbar").click();

    // The item registers in a passive effect, and no state exposes when a
    // stale pending presentation would move focus afterward.
    await flushFrames(page);
    await test.expect(q.button("Hide pending toolbar")).toBeFocused();
    await test.expect(q.button("Bold action")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect an item move before the first composite mount", async ({
    q,
  }) => {
    await q.button("Queue initial unavailable action").click();
    await q.button("Show initially hidden toolbar").click();

    await test.expect(q.button("Show initially hidden toolbar")).toBeFocused();
    await test.expect(q.toolbar("Initially hidden actions")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect a composite move before the first composite mount", async ({
    page,
    q,
  }) => {
    await q.button("Queue initial toolbar").click();
    await q.button("Show initially hidden toolbar").click();

    // The item registers in a passive effect, and no state exposes when a
    // stale pending presentation would move focus afterward.
    await flushFrames(page);
    await test.expect(q.button("Show initially hidden toolbar")).toBeFocused();
    await test.expect(q.button("Initial bold action")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect a derived composite move before the first mount", async ({
    page,
    q,
  }) => {
    await q.button("Queue initial tab list").click();
    await q.button("Show initially hidden tab list").click();

    // The tab registers in a passive effect, and no state exposes when a stale
    // pending presentation would move focus afterward.
    await flushFrames(page);
    await test.expect(q.button("Show initially hidden tab list")).toBeFocused();
    await test.expect(q.tab("Initial tab")).not.toBeFocused();
  });
});
