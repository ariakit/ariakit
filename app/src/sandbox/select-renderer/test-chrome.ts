import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3635526619
  test("releases the explicit scroll target in automatic mode", async ({
    page,
    q,
  }) => {
    const status = q.status("Controller lifetime status");
    await test.expect(status).toContainText("Explicit target ready: yes");

    await q.button("Use automatic scroll element").click();
    for (let revision = 1; revision <= 6; revision += 1) {
      await q.button("Rerender lifetime probe").click();
      await test.expect(status).toContainText(`Revision: ${revision}`);
    }

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("HeapProfiler.collectGarbage");
    await q.button("Check released scroll element").click();

    await test.expect(status).toContainText("Released: yes");
  });
});
