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
    await test.expect(q.status(`${label} current anchor`)).toHaveText("button");
    await expectAligned(test.expect, disclosure, popover);
  });

  test("clears the disclosure fallback when it unmounts", async ({ q }) => {
    const label = "Disclosure first";
    await q.button(`Open ${label}`).click();
    await q.button(`Remove ${label} anchor`).click();
    await q.button(`Remove ${label} disclosure`).click();

    await test.expect(q.status(`${label} current anchor`)).toHaveText("none");
    await test
      .expect(q.status(`${label} current disclosure`))
      .toHaveText("none");
    await test.expect(q.dialog(`${label} details`)).toBeVisible();
  });

  test("preserves HovercardAnchor after keyboard activation", async ({ q }) => {
    const anchor = q.text("Hovercard anchor");
    const hovercard = q.dialog("Hovercard details");

    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await test
      .expect(q.status("Hovercard current anchor"))
      .toHaveText("explicit");
    await expectAligned(test.expect, anchor, hovercard);

    await hovercard.press("Escape");
    const disclosure = q.button("Open Hovercard");
    await disclosure.focus();
    await disclosure.click();

    await test.expect(hovercard).toBeVisible();
    await test
      .expect(q.status("Hovercard current anchor"))
      .toHaveText("explicit");
    await expectAligned(test.expect, anchor, hovercard);
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
        .toHaveText(
          type === "Explicit"
            ? "explicit"
            : type === "Input"
              ? "input"
              : "button",
        );
      await test
        .expect(q.status(`${type} Combobox current disclosure`))
        .toHaveText(type === "Disclosure" ? "button" : "input");

      const anchor =
        type === "Explicit"
          ? q.text("Explicit Combobox anchor")
          : type === "Input"
            ? q.combobox("Input Combobox input")
            : disclosure;
      await expectAligned(test.expect, anchor, popover);

      if (type === "Input") {
        await q.button("Remove Input Combobox input").click();
        await test
          .expect(q.status("Input Combobox current anchor"))
          .toHaveText("button");
        await test
          .expect(q.status("Input Combobox current disclosure"))
          .toHaveText("button");
        await expectAligned(
          test.expect,
          q.button("Open Input Combobox"),
          popover,
        );
      }
    });
  }

  test("provides the Combobox store to disclosure descendants", async ({
    q,
  }) => {
    await test.expect(q.status("Scoped Combobox context")).toHaveText("right");
  });
});
