import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("names a field by its label and describes it by its description before hydration", async ({
    q,
  }) => {
    const checkbox = query(q.article("Field with description")).checkbox();
    await test.expect(checkbox).toHaveAccessibleName("Product updates");
    await test
      .expect(checkbox)
      .toHaveAccessibleDescription("New features and changes to the API");
  });

  test("names a card by its label and describes it by its description before hydration", async ({
    q,
  }) => {
    const checkbox = query(q.article("Card with description")).checkbox();
    await test.expect(checkbox).toHaveAccessibleName("Analytics");
    await test
      .expect(checkbox)
      .toHaveAccessibleDescription(
        "Usage, retention and funnel reports, refreshed every hour",
      );
  });
});
