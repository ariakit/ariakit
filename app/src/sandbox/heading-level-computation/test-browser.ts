import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("standalone Heading defaults to native h1 without aria-level", async ({
    q,
  }) => {
    const heading = q.heading("Standalone heading", { level: 1 });

    await test.expect(heading).toBeVisible();
    await test.expect(heading).toHaveJSProperty("tagName", "H1");
    await test.expect(heading).not.toHaveAttribute("aria-level");
  });

  test("Heading rendered as div falls back to role and aria-level", async ({
    q,
  }) => {
    const heading = q.heading("Rendered heading", { level: 3 });

    await test.expect(heading).toBeVisible();
    await test.expect(heading).toHaveJSProperty("tagName", "DIV");
    await test.expect(heading).toHaveAttribute("role", "heading");
    await test.expect(heading).toHaveAttribute("aria-level", "3");
  });

  test("nested HeadingLevel clamps computed levels to h6", async ({ q }) => {
    const heading = q.heading("Clamped heading", { level: 6 });

    await test.expect(heading).toBeVisible();
    await test.expect(heading).toHaveJSProperty("tagName", "H6");
    await test.expect(heading).not.toHaveAttribute("aria-level");
  });
});
