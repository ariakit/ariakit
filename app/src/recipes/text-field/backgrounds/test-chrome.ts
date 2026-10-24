import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names and describes the field on each background", async ({ q }) => {
    await test
      .expect(q.textbox("Email"))
      .toHaveAccessibleDescription("One newsletter a month.");
    await test
      .expect(q.textbox("Gift message"))
      .toHaveAccessibleDescription("Printed on the card.");
    await test
      .expect(q.textbox("Project name"))
      .toHaveAccessibleDescription("Type the name to confirm.");
  });
});
