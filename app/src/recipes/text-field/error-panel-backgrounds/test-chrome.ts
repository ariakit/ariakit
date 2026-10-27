import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("reads the error panel before the hint on each background", async ({
    q,
  }) => {
    await test
      .expect(q.textbox("Email"))
      .toHaveAttribute("aria-invalid", "true");
    await test
      .expect(q.textbox("Email"))
      .toHaveAccessibleDescription(
        "Enter an email address. One newsletter a month.",
      );
    await test
      .expect(q.textbox("Gift message"))
      .toHaveAttribute("aria-invalid", "true");
    await test
      .expect(q.textbox("Gift message"))
      .toHaveAccessibleDescription(
        "Use 40 characters or fewer. Printed on the card.",
      );
    await test
      .expect(q.textbox("Project name"))
      .toHaveAttribute("aria-invalid", "true");
    await test
      .expect(q.textbox("Project name"))
      .toHaveAccessibleDescription(
        "Type analytical-engine. Type the name to confirm.",
      );
  });
});
