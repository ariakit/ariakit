import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("detaches portalRef before removing the node when the portal prop is toggled off", async ({
    q,
  }) => {
    await test.expect(q.text("Portal content")).toBeVisible();

    await q.button("Disable portal").click();
    // The content is rendered in place once the portal is disabled, and the
    // portalRef cleanup must have run while the node was still in the DOM.
    await test.expect(q.text("Portal content")).toBeVisible();
    await test.expect(q.text("Portal cleanup connected: yes")).toBeVisible();
  });

  test("does not attach an inline portalRef to the removed node when the portal prop is toggled off", async ({
    q,
  }) => {
    await test.expect(q.text("Inline portal content")).toBeVisible();
    await test
      .expect(q.text("Inline portal attach connected: yes"))
      .toBeVisible();

    await q.button("Disable inline portal").click();
    // The content is rendered in place once the portal is disabled, and the
    // new inline portalRef must not have fired against the removed node.
    await test.expect(q.text("Inline portal content")).toBeVisible();
    await test
      .expect(q.text("Inline portal attach connected: yes"))
      .toBeVisible();
  });
});
