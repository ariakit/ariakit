import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "button-fixtures" },
  async ({ test, query }) => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
    test("joins adjacent horizontal borders", async ({ q }) => {
      const box = query(q.article("Button group layout"));
      for (const title of [
        "Horizontal",
        "Stretched",
        "Padded",
        "Numeric zero",
        "Pixel zero",
        "Rem zero",
        "Calculated zero",
      ]) {
        const group = query(box.group(title));
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
      const box = query(q.article("Button group layout"));
      for (const title of ["Spaced", "Vertical", "Wrapped"]) {
        const group = query(box.group(title));
        const middle = group.button("Week");
        await test.expect(middle).toBeVisible();
        await test
          .expect(middle)
          .not.toHaveCSS("border-top-left-radius", "0px");
        await test
          .expect(middle)
          .not.toHaveCSS("border-top-right-radius", "0px");
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
  },
);
