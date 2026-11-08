import { hoverOver } from "#app/test-utils/ariakit-ui.ts";
import { waitPastSlide } from "#app/test-utils/popover.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("slides the shared hovercard to the next anchor", async ({
    page,
    q,
  }) => {
    const section = q.region("Shared");
    await hoverOver(query(section).link("Kai Tanaka"));
    await test.expect(q.dialog("Kai Tanaka")).toBeVisible();
    await waitPastSlide(page);
    // The hovercard opens in place.
    await test.expect(query(section).status()).toHaveText("Slides: 0");
    const noor = query(section).link("Noor Haddad");
    await noor.hover();
    // The anchors share one hovercard, which stays open and changes its
    // content.
    await test.expect(q.dialog("Noor Haddad")).toBeVisible();
    await test.expect(q.dialog()).toHaveCount(1);
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 1");
    await test
      .expect(async () => {
        const anchor = await noor.boundingBox();
        const box = await q.dialog("Noor Haddad").boundingBox();
        test.expect(anchor).not.toBeNull();
        test.expect(box).not.toBeNull();
        if (!anchor || !box) return;
        const anchorCenter = anchor.y + anchor.height / 2;
        const boxCenter = box.y + box.height / 2;
        test.expect(Math.abs(anchorCenter - boxCenter)).toBeLessThan(1);
      })
      .toPass();
  });

  test("opens in place again at another anchor", async ({ page, q }) => {
    const section = q.region("Shared");
    await hoverOver(query(section).link("Kai Tanaka"));
    await test.expect(q.dialog("Kai Tanaka")).toBeVisible();
    // A corner of the page is clear of the hovercard, so the move doesn't
    // scroll the page under it.
    await page.mouse.move(0, 0);
    await test.expect(q.dialog("Kai Tanaka")).toBeHidden();
    await hoverOver(query(section).link("Lena Fischer"));
    await test.expect(q.dialog("Lena Fischer")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });
});
