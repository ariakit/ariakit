import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  test("joins adjacent horizontal borders", async ({ q }) => {
    for (const title of [
      "Horizontal",
      "Stretched",
      "Padded",
      "Numeric zero",
      "Pixel zero",
      "Rem zero",
      "Calculated zero",
    ]) {
      const group = query(q.group(title));
      const first = group.button("Day");
      const middle = group.button("Week");
      await test.expect(first).toBeVisible();
      await test.expect(middle).toHaveCSS("border-left-width", "2px");
      await test.expect
        .poll(async () => {
          const firstBox = await first.boundingBox();
          const middleBox = await middle.boundingBox();
          if (!firstBox || !middleBox) return;
          return firstBox.x + firstBox.width - middleBox.x;
        })
        .toBeCloseTo(2, 1);
      if (title === "Padded") {
        await test.expect(middle).not.toHaveCSS("border-radius", "0px");
      } else {
        await test.expect(middle).toHaveCSS("border-radius", "0px");
      }
    }
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  test("keeps corners on spaced, vertical, and wrapping controls", async ({
    q,
  }) => {
    for (const title of ["Independent", "Spaced", "Vertical", "Wrapped"]) {
      const group = query(q.group(title));
      const middle = group.button("Week");
      await test.expect(middle).toBeVisible();
      await test.expect(middle).not.toHaveCSS("border-top-left-radius", "0px");
      await test.expect(middle).not.toHaveCSS("border-top-right-radius", "0px");
      await test
        .expect(middle)
        .not.toHaveCSS("border-bottom-left-radius", "0px");
      await test
        .expect(middle)
        .not.toHaveCSS("border-bottom-right-radius", "0px");
      await test.expect(middle).toHaveCSS("margin-inline-start", "0px");
      await test.expect(middle).toHaveCSS("margin-inline-end", "0px");
    }
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("tints both shared edges with the hovered control's surface @visual", async ({
    q,
    visual,
  }) => {
    for (const title of ["Horizontal", "Joined vertical"]) {
      const group = query(q.group(title));
      for (const label of ["Day", "Week", "Month"]) {
        const item = group.button(label);
        await item.scrollIntoViewIfNeeded();
        await item.hover();
        await test.expect(item).toHaveCSS("z-index", "1");
        if (label !== "Week") continue;
        await visual({
          element: q.group(title),
          id: `${title}-${label}`,
          styles: {},
        });
      }
    }
  });

  // https://github.com/ariakit/ariakit/issues/7466
  test("keeps the selected glider visible behind its control", async ({
    page,
    q,
  }) => {
    const group = q.group("Glider");
    const month = query(group).button("Month");
    await test.expect(month).not.toHaveCSS("border-end-end-radius", "0px");
    const hasAnchors = await page.evaluate(() =>
      CSS.supports("anchor-name", "--test"),
    );
    if (!hasAnchors) {
      await test.expect(group.locator(".glider")).toBeHidden();
      return;
    }
    const week = query(group).button("Week");
    await test.expect(week).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await test.expect(group.locator(".glider")).toBeVisible();
  });
});
