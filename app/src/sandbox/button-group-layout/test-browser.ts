import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  test("joins adjacent horizontal borders", async ({ q }) => {
    for (const title of [
      "Horizontal",
      "Stretched",
      "Stretched auto",
      "Padded",
      "Numeric zero",
      "Pixel zero",
      "Rem zero",
      "Calculated zero",
    ]) {
      const group = query(q.group(title));
      const first = group.button("Day");
      const middle = group.button("Week");
      const last = group.button("Month");
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
      await test.expect(middle).toHaveCSS("margin-inline-end", "-1px");
      await test.expect(last).toHaveCSS("margin-inline-start", "-1px");
      await test.expect(first).not.toHaveCSS("border-top-left-radius", "0px");
      await test.expect(last).not.toHaveCSS("border-top-right-radius", "0px");
      if (title === "Padded") {
        await test.expect(middle).not.toHaveCSS("border-radius", "0px");
      } else {
        await test.expect(middle).toHaveCSS("border-radius", "0px");
        await test.expect(first).toHaveCSS("border-top-right-radius", "0px");
        await test.expect(last).toHaveCSS("border-top-left-radius", "0px");
      }
    }
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  test("keeps corners on spaced, vertical, and wrapping controls", async ({
    q,
  }) => {
    for (const title of ["Spaced", "Vertical", "Wrapped"]) {
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

  test("keeps independent borders and corners when joining is disabled", async ({
    q,
  }) => {
    for (const name of ["Independent", "Padded independent"]) {
      const group = query(q.group(name));
      for (const label of ["Day", "Week", "Month"]) {
        const button = group.button(label);
        await test.expect(button).toHaveCSS("margin-inline-start", "0px");
        await test.expect(button).toHaveCSS("margin-inline-end", "0px");
        await test
          .expect(button)
          .not.toHaveCSS("border-top-left-radius", "0px");
        await test
          .expect(button)
          .not.toHaveCSS("border-top-right-radius", "0px");
      }
    }
  });

  // https://github.com/ariakit/ariakit/pull/5240
  test("keeps both top corners on unpadded tabs", async ({ q }) => {
    for (const name of [
      "folder tabs",
      "flat tabs",
      "bevel tabs",
      "Folder glider",
    ]) {
      const list = query(q.tablist(name));
      for (const label of ["Preview", "Code", "Usage"]) {
        const tab = list.tab(label);
        await tab.click();
        await test.expect(tab).toHaveAttribute("aria-selected", "true");
        await test.expect(tab).toHaveCSS("border-top-left-radius", "12px");
        await test.expect(tab).toHaveCSS("border-top-right-radius", "12px");
        await test.expect(tab).toHaveCSS("margin-inline-end", "0px");
      }
    }
  });

  test("allows a tab list to opt into joining", async ({ q }) => {
    const list = query(q.tablist("Joined tabs"));
    await test.expect(list.tab("Week")).toHaveCSS("border-radius", "0px");
    await test
      .expect(list.tab("Week"))
      .toHaveCSS("margin-inline-start", "-1px");
    await test.expect(list.tab("Week")).toHaveCSS("margin-inline-end", "-1px");
  });
});
