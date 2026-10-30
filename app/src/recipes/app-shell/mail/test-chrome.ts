import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // A default height moves the main header by nothing. At a fractional root
  // size, the height can still differ from 16 steps by a tiny float residue,
  // which must not move the main header off the body.
  // https://github.com/ariakit/ariakit/issues/8179
  test.describe("in a narrow main column", () => {
    test.use({ viewport: { width: 700, height: 800 } });

    for (const rootSize of [16, 16.3, 17.5, 19.5]) {
      test(`keeps the main header and the body on one edge at a ${rootSize}px root`, async ({
        page,
        q,
      }) => {
        await page.addStyleTag({
          content: `html { font-size: ${rootSize}px; }`,
        });
        const actions = q.group("Message actions");
        const subject = query(q.main()).heading();
        await test.expect(actions).toBeVisible();
        await test.expect(subject).toBeVisible();
        // The sidebar width follows the root font size through a transition.
        await test.expect
          .poll(async () => {
            const actionsBox = await actions.boundingBox();
            const subjectBox = await subject.boundingBox();
            return (subjectBox?.x ?? 0) - (actionsBox?.x ?? 0);
          })
          .toBe(0);
      });
    }
  });
});
