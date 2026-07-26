import { withFramework } from "#app/test-utils/preview.ts";

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
});
