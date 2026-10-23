import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("names a field by its label and describes it by its description before hydration", async ({
    q,
  }) => {
    const radio = query(q.article("Descriptions")).radio("Hobby");
    await test
      .expect(radio)
      .toHaveAccessibleDescription("For side projects and experiments");
  });

  test("names a card by its label and describes it by its description before hydration", async ({
    q,
  }) => {
    const radio = query(q.article("Cards")).radio("Hobby");
    await test
      .expect(radio)
      .toHaveAccessibleDescription("For side projects and experiments");
  });
});
