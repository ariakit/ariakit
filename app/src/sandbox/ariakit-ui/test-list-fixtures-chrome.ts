import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "list-fixtures" },
  async ({ test, query }) => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
    test("omits a conditional list button without hiding its content", async ({
      q,
    }) => {
      const scope = query(q.article("list-disclosure-optional-button"));
      await test.expect(scope.text("Review assigned issues")).toBeVisible();
      await test.expect(scope.button("")).toHaveCount(0);

      await scope.checkbox("Show task headings").check();
      await test.expect(scope.button("Project tasks")).toBeVisible();
      await test.expect(scope.text("Review assigned issues")).toBeHidden();
      await scope.button("Project tasks").click();
      await test.expect(scope.text("Review assigned issues")).toBeVisible();
      await scope.button("Project tasks").click();
      await test.expect(scope.text("Review assigned issues")).toBeHidden();

      await scope.checkbox("Show task headings").uncheck();
      await test.expect(scope.text("Review assigned issues")).toBeVisible();
      await test.expect(scope.button("Project tasks")).toHaveCount(0);
      await test.expect(scope.button("")).toHaveCount(0);
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
    test("keeps zero as a list button label", async ({ q }) => {
      const scope = query(q.article("list-disclosure-optional-button"));
      const button = scope.button("0");
      await test.expect(button).toBeVisible();
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await button.click();
      await test.expect(button).toHaveAttribute("aria-expanded", "true");
      await test.expect(scope.text("No pending tasks")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
    test("uses progress as the default check state and preserves explicit values", async ({
      q,
    }) => {
      const scope = query(q.article("list-item-marker-checked"));
      const completed = query(scope.list("Completed progress"));
      const unchecked = query(scope.list("Explicit unchecked state"));
      const checked = query(scope.list("Explicit checked state"));
      await test.expect(completed.img("Checked")).toBeVisible();
      await test.expect(unchecked.img("Unchecked")).toBeVisible();
      await test.expect(checked.img("Checked")).toBeVisible();
    });

    // The empty slot's own edge weight used to apply under $edgeRaw too, so the
    // ring came out translucent instead of in the exact edge color.
    test("paints a raw marker edge in the exact color", async ({ q }) => {
      const marker = query(q.article("Raw marker edge")).img("Unchecked");
      // An opaque color serializes without an alpha part.
      await test
        .expect(marker)
        .toHaveCSS(
          "box-shadow",
          /oklch\([\d.]+ [\d.]+ [\d.]+\) 0px 0px 0px 1px inset/,
        );
    });
  },
);
