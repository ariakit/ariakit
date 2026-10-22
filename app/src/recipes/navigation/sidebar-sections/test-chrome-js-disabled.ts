import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("names a link by its label and describes it by its count before hydration", async ({
    q,
  }) => {
    const nav = query(q.navigation("Site"));
    const link = nav.link(/^Combobox/);
    await test.expect(link).toHaveAccessibleName("Combobox");
    await test.expect(link).toHaveAccessibleDescription("12 examples");
  });
});
