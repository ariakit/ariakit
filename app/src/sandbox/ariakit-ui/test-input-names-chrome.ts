import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "input" },
  async ({ test, query }) => {
    test("links each hint and error message to its field", async ({ q }) => {
      const field = query(q.article("Labeled field with hint")).textbox(
        "Display name",
      );
      await test
        .expect(field)
        .toHaveAccessibleDescription("Shown on your public profile.");

      const invalid = query(q.article("Invalid")).textbox("Email");
      await test.expect(invalid).toHaveAttribute("aria-invalid", "true");
      await test
        .expect(invalid)
        .toHaveAccessibleDescription("Enter a valid email address.");
    });

    test("names a field from the label around it", async ({ q }) => {
      const field = query(q.article("Small")).textbox("Postal code");
      await test.expect(field).toBeEditable();
    });

    test("keeps the key hint out of the search trigger name", async ({ q }) => {
      const trigger = query(q.article("Search trigger")).button("Search docs");
      await test.expect(trigger).toBeVisible();
    });

    test("keeps the share link read-only", async ({ q }) => {
      const box = query(q.article("Share link with copy button"));
      const input = box.textbox("Share link");
      await test.expect(input).toHaveValue("ariakit.com/ui");
      await test.expect(input).not.toBeEditable();
    });
  },
);
