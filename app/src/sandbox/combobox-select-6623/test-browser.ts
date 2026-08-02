import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6623
  test("redirects focus to the select when an option is focused on mount", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.evaluate((element) => {
      if (!(element instanceof HTMLElement)) return;
      const focusCalls: Array<FocusOptions | undefined> = [];
      Object.assign(element, { focusCalls });
      element.focus = (options) => {
        focusCalls.push(options);
        HTMLElement.prototype.focus.call(element, options);
      };
    });
    await select.click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    test
      .expect(
        await select.evaluate(
          (element) =>
            (
              element as HTMLElement & {
                focusCalls?: Array<FocusOptions | undefined>;
              }
            ).focusCalls,
        ),
      )
      .toContainEqual({ preventScroll: true });
  });

  // https://github.com/ariakit/ariakit/issues/6623
  test("discards the redirect when the option loses focus before the listbox is available", async ({
    page,
    q,
  }) => {
    await q.checkbox("Show search").click();
    await q.combobox("Favorite fruit").click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.combobox("Search fruits")).toBeFocused();
    // Give a stray redirect a chance to fire before asserting focus stayed
    // put.
    await page.waitForTimeout(200);
    await test.expect(q.combobox("Search fruits")).toBeFocused();
  });
});
