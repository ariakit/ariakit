import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("names the editor screen and the fill field", async ({ q }) => {
    // The document title starts the heading outline above the mock page.
    await test
      .expect(q.heading("Spring Sale Landing Page"))
      .toHaveJSProperty("tagName", "H1");
    const properties = query(q.complementary("Properties"));
    await test.expect(properties.textbox("Fill")).toHaveValue("#111827");
  });
});
