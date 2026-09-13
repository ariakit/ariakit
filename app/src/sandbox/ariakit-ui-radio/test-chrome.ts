import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7474
  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997181250
  test("uses compact text for a card badge", async ({ q }) => {
    const badge = query(q.article("Disabled card slots")).text("3");
    await test.expect(badge).toHaveCSS("font-size", "13px");
  });
});
