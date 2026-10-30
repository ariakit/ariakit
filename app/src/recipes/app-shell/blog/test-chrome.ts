import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Three bar steps are 10.5px at the default shell size. The body after the
  // intro and the sidebar that starts beside it must round them the same way.
  // https://github.com/ariakit/ariakit/issues/8179
  test.describe("with room for the body sidebar", () => {
    test.use({ viewport: { width: 1500, height: 800 } });

    test("starts the body and the sidebar on one line", async ({ q }) => {
      const body = await q.text(/^Most interfaces compete/).boundingBox();
      const sidebar = query(q.navigation("On this page"));
      const label = await sidebar.text("On this page").boundingBox();
      test.expect(label?.y).toBe(body?.y);
    });
  });
});
