import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7474
  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997181250
  test("uses compact text for a card badge", async ({ q }) => {
    const badge = query(q.article("Disabled card slots")).text("3");
    await test.expect(badge).toHaveCSS("font-size", "13px");
  });

  // https://github.com/ariakit/ariakit/issues/7474
  test("dims badge and avatar slots when the card grid is disabled", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const box = query(q.article("Disabled card slots"));
        const radio = box.radio("J Jane Doe 3");
        await test.expect(radio).toBeDisabled();
        const slots = [];
        for (const slot of [box.text("J"), box.text("3").locator("..")]) {
          await test.expect(slot).toHaveCSS("opacity", "1");
          const background = await slot.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          );
          slots.push({ slot, background });
        }
        await box.button("Enable card grid").click();
        await test.expect(radio).toBeEnabled();
        for (const { slot, background } of slots) {
          await test.expect(slot).toHaveCSS("opacity", "1");
          await test.expect(slot).not.toHaveCSS("background-color", background);
        }
        await box.button("Disable card grid").click();
        await test.expect(radio).toBeDisabled();
        for (const { slot, background } of slots) {
          await test.expect(slot).toHaveCSS("background-color", background);
        }
      });
    }
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("lights an enabled card on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cards");
      // The card is the label around the hidden input.
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });

  test("keeps a card of a disabled grid unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Disabled card grid");
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });
});
