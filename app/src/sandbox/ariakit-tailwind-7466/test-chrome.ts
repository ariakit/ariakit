import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
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
