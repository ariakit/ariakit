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

  test("falls back to the disclosure when the explicit anchor unmounts", async ({
    q,
  }) => {
    const label = "Disclosure first";
    await q.button(`Open ${label}`).click();
    await q.button(`Remove ${label} anchor`).click();

    await test.expect(q.status(`${label} current anchor`)).toHaveText("none");

    const disclosureCenter = await getVerticalCenter(q.button(`Open ${label}`));
    const popoverCenter = await getVerticalCenter(q.dialog(`${label} details`));
    test
      .expect(Math.abs(popoverCenter - disclosureCenter))
      .toBeLessThanOrEqual(1);
  });

  test("clears a disclosure fallback when its element unmounts", async ({
    q,
  }) => {
    const anchor = q.status("Removable disclosure current anchor");

    await q.button("Open removable disclosure").click();
    await q.button("Remove Popover disclosure").click();
    await test.expect(anchor).toHaveText("explicit");
    await test
      .expect(q.status("Removable disclosure current disclosure"))
      .toHaveText("none");

    await q.button("Remove Popover anchor").click();
    await test.expect(anchor).toHaveText("none");
  });

  test("preserves MenuAnchor when MenuButton opens the menu", async ({ q }) => {
    const button = q.button("Open Menu");
    await button.click();

    const menu = q.menu("Menu items");
    await test.expect(menu).toBeVisible();
    await test.expect(q.status("Menu current anchor")).toHaveText("explicit");

    const anchorCenter = await getVerticalCenter(q.text("Menu anchor"));
    const menuCenter = await getVerticalCenter(menu);
    test.expect(Math.abs(menuCenter - anchorCenter)).toBeLessThanOrEqual(1);

    await menu.press("Escape");
    await test.expect(button).toBeFocused();
  });

  test("preserves a consumer MenuButton anchor override", async ({ q }) => {
    await q.button("Open Override Menu").click();

    await test
      .expect(q.status("Override Menu current anchor"))
      .toHaveText("group");
  });

  test("keeps a hover menu open on its disclosure with a separate anchor", async ({
    page,
    q,
  }) => {
    const button = q.button("Open Hover Menu");
    const menu = q.menu("Hover Menu items");

    await button.hover();
    await test.expect(menu).toBeVisible();
    await button.hover({ position: { x: 1, y: 1 } });
    await page.waitForTimeout(50);
    await test.expect(menu).toBeVisible();
  });

  test("positions SelectPopover next to SelectAnchor", async ({ q }) => {
    await q.combobox("Open Select").click();

    const popover = q.listbox("Select items");
    await test.expect(popover).toBeVisible();
    await test.expect(q.status("Select current anchor")).toHaveText("explicit");

    const anchorCenter = await getVerticalCenter(q.text("Select anchor"));
    const popoverCenter = await getVerticalCenter(popover);
    test.expect(Math.abs(popoverCenter - anchorCenter)).toBeLessThanOrEqual(1);
  });

  test("positions ComboboxPopover next to ComboboxAnchor", async ({ q }) => {
    await q.button("Open Combobox").click();

    const popover = q.listbox("Combobox items");
    await test.expect(popover).toBeVisible();
    await test
      .expect(q.status("Combobox current anchor"))
      .toHaveText("explicit");
    await test
      .expect(q.status("Combobox current disclosure"))
      .toHaveText("disclosure");

    const anchorCenter = await getVerticalCenter(q.text("Combobox anchor"));
    const popoverCenter = await getVerticalCenter(popover);
    test.expect(Math.abs(popoverCenter - anchorCenter)).toBeLessThanOrEqual(1);
  });

  test("falls back to Combobox after ComboboxAnchor unmounts", async ({
    q,
  }) => {
    await q.button("Remove Combobox anchor").click();
    await test.expect(q.status("Combobox current anchor")).toHaveText("none");

    await q.button("Open Combobox").click();
    const popover = q.listbox("Combobox items");
    await test.expect(popover).toBeVisible();

    const comboboxCenter = await getVerticalCenter(q.combobox("Combobox"));
    const popoverCenter = await getVerticalCenter(popover);
    test
      .expect(Math.abs(popoverCenter - comboboxCenter))
      .toBeLessThanOrEqual(1);

    await q.button("Remove Combobox input").click();
    await test.expect(q.status("Combobox current anchor")).toHaveText("none");
    await test.expect(popover).toBeHidden();

    await q.button("Open Combobox").click();
    await test.expect(popover).toBeVisible();

    const disclosureCenter = await getVerticalCenter(q.button("Open Combobox"));
    const fallbackPopoverCenter = await getVerticalCenter(popover);
    test
      .expect(Math.abs(fallbackPopoverCenter - disclosureCenter))
      .toBeLessThanOrEqual(1);
  });

  test("toggles once when ComboboxDisclosure is composed", async ({ q }) => {
    await q.button("Open composed Combobox").click();

    await test.expect(q.listbox("Composed Combobox items")).toBeVisible();
    await test
      .expect(q.status("Composed Combobox current anchor"))
      .toHaveText("none");
  });

  test("tracks ComboboxDisclosure across default-open mount transitions", async ({
    q,
  }) => {
    const disclosure = q.status("Default open Combobox current disclosure");
    await test.expect(disclosure).toHaveText("second-disclosure");

    await q.button("Remove second default open Combobox disclosure").click();
    await test.expect(disclosure).toHaveText("first-disclosure");

    await q.button("Remove first default open Combobox disclosure").click();
    await test.expect(disclosure).toHaveText("combobox");

    await q.button("Mount first default open Combobox disclosure").click();
    await test.expect(disclosure).toHaveText("first-disclosure");

    await q.button("Remove all default open Combobox controls").click();
    await test.expect(disclosure).toHaveText("none");
  });

  test("registers HovercardAnchor when a disclosure is present", async ({
    page,
    q,
  }) => {
    const currentAnchor = q.status("Hovercard current anchor");
    await test.expect(currentAnchor).toHaveText("none");

    await q.button("Mount Hovercard anchor").click();
    await test.expect(currentAnchor).toHaveText("first");

    await q.button("Mount second Hovercard anchor").click();
    await test.expect(currentAnchor).toHaveText("first");

    await q.link("Hovercard anchor").scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await q.link("Hovercard anchor").hover();
    const hovercard = q.dialog("Hovercard details");
    await test.expect(hovercard).toBeVisible();

    const anchorCenter = await getVerticalCenter(q.link("Hovercard anchor"));
    const hovercardCenter = await getVerticalCenter(hovercard);
    test
      .expect(Math.abs(hovercardCenter - anchorCenter))
      .toBeLessThanOrEqual(1);
  });
});
