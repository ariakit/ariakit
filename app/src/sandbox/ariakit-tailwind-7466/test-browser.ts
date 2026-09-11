import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const contrast of ["no-preference", "more"] as const) {
      for (const title of [
        "Applied",
        "Border 1",
        "Border 2",
        "Border 4",
        "Border 8",
        "Border 3",
        "Ring 2",
        "Fractional ring",
        "Adaptive 2",
        "RTL",
        "Vertical",
        "Vertical ring",
        "No edge",
        "Shadow without edge",
      ]) {
        // https://github.com/ariakit/ariakit/issues/7466
        test(`${title} joins edges through hover (${colorScheme}, ${contrast}) @visual`, async ({
          page,
          q,
          visual,
        }) => {
          await page.emulateMedia({ colorScheme, contrast });
          const group = query(q.group(title));
          await page.mouse.move(0, 0);
          const idleItem = group.button("Week");
          await idleItem.scrollIntoViewIfNeeded();
          await visual({
            element: q.group(title),
            id: `${title}-idle`,
            styles: {},
          });
          for (const label of ["Day", "Week", "Month"]) {
            const item = group.button(label);
            await item.scrollIntoViewIfNeeded();
            const geometry = () =>
              item.evaluate((element) => {
                const box = element.getBoundingClientRect();
                return {
                  x: box.x + window.scrollX,
                  y: box.y + window.scrollY,
                  width: box.width,
                  height: box.height,
                };
              });
            const before = await geometry();
            await item.hover();
            await expect(item).toHaveCSS("z-index", "1");
            expect(await geometry()).toEqual(before);
            await visual({
              element: q.group(title),
              id: `${title}-${label}`,
              styles: {},
            });
          }
        });
      }
    }
  }

  // https://github.com/ariakit/ariakit/issues/7466
  test("joins fractional outside rings", async ({ q }) => {
    const group = query(q.group("Fractional ring"));
    const day = group.button("Day");
    const week = group.button("Week");
    await expect(day).toBeVisible();
    const end = await day.evaluate(
      (element) => element.getBoundingClientRect().right,
    );
    const start = await week.evaluate(
      (element) => element.getBoundingClientRect().left,
    );
    expect(start - end).toBe(0.5);
    await expect(week).toHaveCSS("box-shadow", /0px 0px 0px 0\.5px/);
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("preserves the theme's default frame ring color", async ({ q }) => {
    await expect(q.button("Theme ring")).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(q.button("Theme ring")).toHaveCSS(
      "box-shadow",
      /rgb\(0, 0, 255\) 0px 0px 0px 2px/,
    );
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("keeps a nested independent group separate", async ({ q }) => {
    const week = query(q.group("Nested independent")).button("Week");
    await expect(week).toHaveCSS("margin-inline-start", "0px");
    await expect(week).toHaveCSS("margin-inline-end", "0px");
    await expect(week).not.toHaveCSS("border-radius", "0px");
    await expect(week).toHaveCSS("box-shadow", /0px 0px 0px 2px/);
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("joins items through @apply in separate custom classes", async ({
    q,
  }) => {
    const group = query(q.group("Applied"));
    const day = group.button("Day");
    const week = group.button("Week");
    await expect(q.group("Applied")).toHaveClass("applied-group");
    await expect(day).toHaveClass("applied-item");
    await expect(week).toHaveCSS("margin-inline-start", "-1px");
    await expect(week).toHaveCSS("margin-inline-end", "-1px");
    await expect(week).toHaveCSS("border-radius", "0px");
    await week.hover();
    await expect(week).toHaveCSS("z-index", "1");
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("later active items own boundaries shared by two active items @visual", async ({
    q,
    visual,
  }) => {
    const group = query(q.group("Border 2"));
    const day = group.button("Day");
    const week = group.button("Week");
    await day.click();
    await week.click();
    await expect(day).toHaveAttribute("aria-pressed", "true");
    await expect(week).toHaveAttribute("aria-pressed", "true");
    await day.hover();
    await expect(day).toHaveCSS("z-index", "1");
    await expect(week).toHaveCSS("z-index", "1");
    await visual({
      element: q.group("Border 2"),
      id: "selected-selected",
      styles: {},
    });
    await week.hover();
    await visual({
      element: q.group("Border 2"),
      id: "hover-selected",
      styles: {},
    });
    await week.click();
    await day.hover();
    await expect(week).toHaveCSS("z-index", "0");
    await visual({
      element: q.group("Border 2"),
      id: "selected-idle",
      styles: {},
    });
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
  test("allows explicit focus stacking above an active neighbor @visual", async ({
    page,
    q,
    visual,
  }) => {
    const group = query(q.group("Focus priority"));
    const week = group.button("Week");
    const month = group.button("Month");
    await page.keyboard.press("Tab");
    await week.focus();
    await expect(week).toBeFocused();
    await expect(week).toHaveCSS("z-index", "10");
    await expect(month).toHaveCSS("z-index", "1");
    await visual({ element: q.group("Focus priority"), styles: {} });
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("preserves native Tailwind rings with programmatic focus", async ({
    page,
    q,
  }) => {
    const group = query(q.group("Focus priority"));
    await page.keyboard.press("Tab");
    await group.button("Week").focus();
    await expect(group.button("Week")).toHaveCSS(
      "box-shadow",
      /rgb\(255, 0, 0\) 0px 0px 0px 2px/,
    );
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
    await expect(unbordered).toHaveCSS("box-shadow", "none");
  });
});
