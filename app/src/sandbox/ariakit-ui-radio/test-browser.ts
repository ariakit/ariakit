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

  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997302340
  test("matches native card contrast for ARIA and script disabled states", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const box = query(q.article("Disabled card badges"));
        const native = box.radio("Email 3");
        const input = box.radio("Messages 3");
        const card = input.locator("..");
        const reference = native.locator("..");
        const pairs = [
          [card, reference],
          [query(card).text("Messages"), query(reference).text("Email")],
          [
            query(card).text("3").locator(".."),
            query(reference).text("3").locator(".."),
          ],
        ] as const;
        await test.expect(input).toBeDisabled();
        for (const attribute of ["aria-disabled", "disabled"]) {
          await input.evaluate((element, name) => {
            element.removeAttribute("disabled");
            element.removeAttribute("aria-disabled");
            element.setAttribute(name, "true");
          }, attribute);
          await test.expect(input).toBeDisabled();
          for (const [actual, expected] of pairs) {
            const color = await expected.evaluate(
              (element) => getComputedStyle(element).color,
            );
            await test.expect(actual).toHaveCSS("color", color);
          }
          const disabledColor = await card.evaluate(
            (element) => getComputedStyle(element).color,
          );
          await input.evaluate((element) => {
            element.removeAttribute("disabled");
            element.removeAttribute("aria-disabled");
          });
          await test.expect(input).toBeEnabled();
          await test.expect(card).not.toHaveCSS("color", disabledColor);
        }
        await input.evaluate((element) =>
          element.setAttribute("aria-disabled", "true"),
        );
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
