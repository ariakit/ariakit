import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("renders an unlabeled group with native buttons", async ({ q }) => {
    const group = q.group();
    await test.expect(group).toBeVisible();
    await test.expect(group).not.toHaveAttribute("aria-label");
    await test.expect(group).not.toHaveAttribute("aria-labelledby");
    await test
      .expect(query(group).button("Bold"))
      .toHaveAttribute("type", "button");
    await test
      .expect(query(group).button("Italic"))
      .toHaveAttribute("type", "button");
    await test
      .expect(query(group).button("Underline"))
      .toHaveAttribute("type", "button");
  });
});
