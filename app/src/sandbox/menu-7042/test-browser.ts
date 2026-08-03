import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  type Query = ReturnType<typeof query>;

  const prepare = async (label: string, page: Page, q: Query) => {
    const menu = q.menu(label);
    const withinMenu = query(menu);
    await q.button(`Show ${label}`).click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");

    await withinMenu.menuitem("New").focus();
    await test.expect(withinMenu.menuitem("New")).toBeFocused();
    await page.keyboard.press("End");

    const rename = withinMenu.menuitem("Rename");
    await test.expect(rename).toHaveAttribute("data-active-item");
    await test.expect(rename).toBeFocused();
    return { menu, rename, withinMenu };
  };

  const finishPositioningWithoutMovingFocus = async (
    label: string,
    q: Query,
  ) => {
    await q.button(`Finish ${label} positioning`).evaluate((element) => {
      // A real click would move focus to the control before resolving the
      // placement promise, which is not part of the reported interaction.
      if (element instanceof HTMLElement) element.click();
    });
  };

  test("presents a focused item when its node stays connected", async ({
    page,
    q,
  }) => {
    const { menu, rename } = await prepare("Stable actions", page, q);

    await finishPositioningWithoutMovingFocus("Stable actions", q);
    await test.expect(rename).toBeFocused();
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("presents a focused item after its node is replaced", async ({
    page,
    q,
  }) => {
    const { menu, withinMenu } = await prepare("Replaced actions", page, q);

    // Dispatching the replacement without a native click keeps the removed
    // item as the browser's focus provenance until React commits the new node.
    await q.button("Replace Replaced actions items").evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });
    const replacement = withinMenu.menuitem("Rename");
    await test.expect(replacement).toHaveAttribute("data-active-item");

    await finishPositioningWithoutMovingFocus("Replaced actions", q);
    await test.expect(replacement).toBeFocused();
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });
});
