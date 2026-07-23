import type { Expect, Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getVerticalCenter(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box.y + box.height / 2;
}

async function expectAligned(expect: Expect, anchor: Locator, popup: Locator) {
  await expect
    .poll(async () => {
      const anchorCenter = await getVerticalCenter(anchor);
      const popupCenter = await getVerticalCenter(popup);
      return Math.abs(popupCenter - anchorCenter);
    })
    .toBeLessThanOrEqual(1);
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of ["Disclosure first", "Anchor first"]) {
    // https://github.com/ariakit/ariakit/issues/3729
    test(`positions the popover next to PopoverAnchor when rendered ${label.toLowerCase()}`, async ({
      q,
    }) => {
      const disclosure = q.button(`Open ${label}`);
      await disclosure.click();

      const popover = q.dialog(`${label} details`);
      await test.expect(popover).toBeVisible();
      await test
        .expect(q.status(`${label} current anchor`))
        .toHaveText("explicit");
      await expectAligned(test.expect, q.text(`${label} anchor`), popover);
    });
  }

  test("falls back to PopoverDisclosure when PopoverAnchor unmounts", async ({
    q,
  }) => {
    const label = "Disclosure first";
    const disclosure = q.button(`Open ${label}`);
    await disclosure.click();
    await q.button(`Remove ${label} anchor`).click();

    const popover = q.dialog(`${label} details`);
    await test.expect(popover).toBeVisible();
    await test.expect(q.status(`${label} current anchor`)).toHaveText("none");
    await expectAligned(test.expect, disclosure, popover);
  });

  test("clears PopoverDisclosure fallback when it unmounts", async ({ q }) => {
    const label = "Disclosure first";
    await q.button(`Open ${label}`).click();
    await q.button(`Remove ${label} anchor`).click();

    const disclosure = q.status(`${label} current disclosure`);
    await test.expect(disclosure).toHaveText("button");
    await q.button(`Remove ${label} disclosure`).click();

    await test.expect(disclosure).toHaveText("none");
    await test.expect(q.dialog(`${label} details`)).toBeVisible();
  });

  test("keeps MenuButton as the disclosure for MenuAnchor", async ({ q }) => {
    const button = q.button("Open Menu");
    await button.click();

    const menu = q.menu("Menu items");
    await test.expect(menu).toBeVisible();
    await test.expect(q.status("Menu current anchor")).toHaveText("explicit");
    await test.expect(q.status("Menu current disclosure")).toHaveText("button");
    await expectAligned(test.expect, q.text("Menu anchor"), menu);

    await menu.press("Escape");
    await test.expect(button).toBeFocused();
  });

  test("keeps a hover menu open over MenuButton", async ({ page, q }) => {
    const button = q.button("Open Hover Menu");
    const menu = q.menu("Hover Menu items");

    await button.hover();
    await test.expect(menu).toBeVisible();
    await button.hover({ position: { x: 1, y: 1 } });
    // Flush the zero-delay hide timer and resulting render before asserting.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          window.setTimeout(() =>
            window.requestAnimationFrame(() => resolve()),
          );
        }),
    );
    await test.expect(menu).toBeVisible();
  });

  test("positions SelectPopover next to SelectAnchor", async ({ q }) => {
    await q.combobox("Open Select").click();

    const popover = q.listbox("Select items");
    await test.expect(popover).toBeVisible();
    await test.expect(q.status("Select current anchor")).toHaveText("explicit");
    await expectAligned(test.expect, q.text("Select anchor"), popover);
  });

  for (const type of ["Explicit", "Input", "Disclosure"]) {
    test(`uses the ${type.toLowerCase()} Combobox anchor`, async ({ q }) => {
      const disclosure = q.button(`Open ${type} Combobox`);
      await disclosure.click();

      const popover = q.listbox(`${type} Combobox items`);
      await test.expect(popover).toBeVisible();
      await test
        .expect(q.status(`${type} Combobox current anchor`))
        .toHaveText(type === "Explicit" ? "explicit" : "none");
      await test
        .expect(q.status(`${type} Combobox current disclosure`))
        .toHaveText("button");

      const anchor =
        type === "Explicit"
          ? q.text("Explicit Combobox anchor")
          : type === "Input"
            ? q.combobox("Input Combobox input")
            : disclosure;
      await expectAligned(test.expect, anchor, popover);

      if (type === "Input") {
        await q.combobox("Input Combobox input").press("Escape");
        await test.expect(popover).not.toBeVisible();
      }
    });
  }

  test("clears HovercardAnchor when it unmounts on show", async ({ q }) => {
    const anchor = q.status("Hovercard current anchor");
    const disclosure = q.status("Hovercard current disclosure");
    await test.expect(anchor).toHaveText("hovercard");

    await q.link("Hovercard anchor").hover();

    await test.expect(q.dialog("Unmount Hovercard")).toBeVisible();
    await test.expect(anchor).toHaveText("none");
    await test.expect(disclosure).toHaveText("none");
  });
});
