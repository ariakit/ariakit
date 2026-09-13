import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997302340
  test("matches native card contrast for ARIA and script disabled states", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const box = query(q.article("Disabled card badges"));
        const native = box.checkbox("Email 3");
        const input = box.checkbox("Messages 3");
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

  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997782168
  test("matches native field contrast for ARIA and script disabled states", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const box = query(q.article("Disabled field labels"));
        const native = box.checkbox("Email Receive email updates.");
        const input = box.checkbox("Messages Receive message updates.");
        const field = input.locator("..");
        const reference = native.locator("..");
        const pairs = [
          [field, reference],
          [query(field).text("Messages"), query(reference).text("Email")],
          [
            query(field).text("Receive message updates."),
            query(reference).text("Receive email updates."),
          ],
        ] as const;
        await test.expect(input).toBeDisabled();
        await input.evaluate((element) => {
          element.removeAttribute("disabled");
          element.removeAttribute("aria-disabled");
        });
        const enabledColors = await Promise.all(
          pairs.map(([element]) =>
            element.evaluate((node) => getComputedStyle(node).color),
          ),
        );
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
          await input.evaluate((element) => {
            element.removeAttribute("disabled");
            element.removeAttribute("aria-disabled");
          });
          await test.expect(input).toBeEnabled();
          for (const [index, [element]] of pairs.entries()) {
            const color = enabledColors[index];
            if (color == null) continue;
            await test.expect(element).toHaveCSS("color", color);
          }
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

  test("draws the ring of a focused field on its box @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Checkbox field");
      const input = query(box).checkbox("Remember me");
      await tabTo(page, input);
      await expectFocusVisible(input);
      await captureInView(visual, box, colorScheme);
    });
  });
});
