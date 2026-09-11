import { expect } from "@playwright/test";
import { edgePixels, expectSameColor } from "#app/test-utils/frame-pixels.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const contrast of ["no-preference", "more"] as const) {
      // https://github.com/ariakit/ariakit/issues/7466
      test(`paints one edge per hovered boundary (${colorScheme}, ${contrast})`, async ({
        page,
        q,
      }) => {
        await page.emulateMedia({ colorScheme, contrast });
        for (const title of [
          "Border 1",
          "Border 2",
          "Border 4",
          "Border 8",
          "Border 3",
          "Ring 2",
          "Adaptive 2",
          "RTL",
          "Vertical",
          "Vertical ring",
        ]) {
          const group = query(q.group(title));
          await page.mouse.move(0, 0);
          const idleItem = group.button("Week");
          await idleItem.scrollIntoViewIfNeeded();
          const idlePixels = await edgePixels(page, idleItem);
          expectSameColor(idlePixels.left, idlePixels.top);
          expectSameColor(idlePixels.right, idlePixels.top);
          expectSameColor(idlePixels.bottom, idlePixels.top);
          for (const label of ["Day", "Week", "Month"]) {
            const item = group.button(label);
            await item.scrollIntoViewIfNeeded();
            const before = await item.boundingBox();
            await item.hover();
            await expect(item).toHaveCSS("z-index", "1");
            const pixels = await edgePixels(page, item);
            expectSameColor(pixels.left, pixels.top);
            expectSameColor(pixels.right, pixels.top);
            expectSameColor(pixels.bottom, pixels.top);
            expect(await item.boundingBox()).toEqual(before);
          }
        }
      });
    }
  }

  // https://github.com/ariakit/ariakit/issues/7466
  test("later active items own boundaries shared by two active items", async ({
    page,
    q,
  }) => {
    const group = query(q.group("Border 2"));
    const day = group.button("Day");
    const week = group.button("Week");
    await day.click();
    await week.click();
    await expect(day).toHaveAttribute("aria-pressed", "true");
    await expect(week).toHaveAttribute("aria-pressed", "true");
    await day.hover();
    const pixels = await edgePixels(page, week);
    expectSameColor(pixels.left, pixels.top);
    expectSameColor(pixels.right, pixels.top);
    await week.click();
    await day.hover();
    const activePixels = await edgePixels(page, day);
    expectSameColor(activePixels.right, activePixels.top);
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("keeps cover geometry, padding, and skipped siblings", async ({ q }) => {
    const nested = query(q.group("Nested cover"));
    await expect(nested.button("Week").locator("span")).toHaveCSS(
      "border-radius",
      "0px",
    );
    await expect(nested.button("Day").locator("span")).toHaveCSS(
      "border-start-end-radius",
      "0px",
    );
    const covered = query(q.group("Cover"));
    const middle = covered.button("Week");
    await expect(middle).toHaveCSS("margin-inline-start", "-1px");
    await expect(middle).toHaveCSS("margin-inline-end", "-1px");
    await expect(middle).toHaveCSS("margin-block-start", "-2px");
    await expect(middle).toHaveCSS("border-radius", "0px");
    await expect(covered.button("Day")).toHaveCSS(
      "margin-inline-start",
      "-2px",
    );
    await expect(covered.button("Month")).toHaveCSS(
      "margin-inline-end",
      "-2px",
    );
    const padded = query(q.group("Padded")).button("Week");
    await expect(padded).toHaveCSS("margin-inline-start", "-1px");
    await expect(padded).not.toHaveCSS("border-radius", "0px");
    const spaced = query(q.group("Auto gap")).button("Week");
    await expect(spaced).toHaveCSS("margin-inline-start", "0px");
    await expect(spaced).not.toHaveCSS("border-radius", "0px");
    const hidden = query(q.group("Hidden items"));
    await q.checkbox("Hide Day and Month").check();
    await expect(hidden.button("Day")).toBeHidden();
    await expect(hidden.button("Month")).toBeHidden();
    await expect(hidden.button("Week")).toHaveCSS("margin-inline-start", "0px");
    await expect(hidden.button("Week")).toHaveCSS("margin-inline-end", "0px");
    await expect(hidden.button("Week")).not.toHaveCSS("border-radius", "0px");
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("preserves shadows, keyboard focus, and unbordered transparent layers", async ({
    page,
    q,
  }) => {
    const item = query(q.group("Shadow")).button("Week");
    await item.scrollIntoViewIfNeeded();
    await item.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(item).toBeFocused();
    await expect(item).toHaveCSS("outline-style", "solid");
    await expect(item).toHaveCSS("outline-width", "2px");
    await expect(item).toHaveCSS("box-shadow", /rgb\(255, 0, 0\) 0px 6px 8px/);
    await expect(item).toHaveCSS(
      "box-shadow",
      /rgb\(0, 0, 255\) 0px 2px 2px.*inset/,
    );
    const unbordered = query(q.group("No edge")).button("Week");
    await expect(unbordered).toHaveCSS("background-color", /\/ 0\)$/);
  });
});
