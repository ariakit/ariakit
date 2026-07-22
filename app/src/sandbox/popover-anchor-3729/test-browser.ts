import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getVerticalCenter(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box.y + box.height / 2;
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of ["Disclosure first", "Anchor first", "Provider store"]) {
    // https://github.com/ariakit/ariakit/issues/3729
    test(`positions the popover next to the explicit anchor when the ${label.toLowerCase()}`, async ({
      q,
    }) => {
      const disclosure = q.button(`Open ${label}`);
      await test.expect(disclosure).toHaveAttribute("aria-haspopup", "dialog");
      await disclosure.click();
      await test.expect(disclosure).toHaveAttribute("aria-expanded", "true");

      const anchor = q.text(`${label} anchor`);
      const popover = q.dialog(`${label} details`);
      await test.expect(popover).toBeVisible();

      const anchorCenter = await getVerticalCenter(anchor);
      const popoverCenter = await getVerticalCenter(popover);
      test
        .expect(Math.abs(popoverCenter - anchorCenter))
        .toBeLessThanOrEqual(1);
    });
  }

  test("preserves the MenuButton interaction anchor", async ({ q }) => {
    const button = q.button("Open Menu");
    await button.click();

    const menu = q.menu();
    await test.expect(menu).toBeVisible();
    await test
      .expect(q.status("Menu current anchor"))
      .toHaveText("menu-button");

    const buttonCenter = await getVerticalCenter(button);
    const menuCenter = await getVerticalCenter(menu);
    test.expect(Math.abs(menuCenter - buttonCenter)).toBeLessThanOrEqual(1);
  });
});
