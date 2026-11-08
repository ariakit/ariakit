import { hoverOver, tabTo } from "#app/test-utils/ariakit-ui.ts";
import { waitPastSlide } from "#app/test-utils/popover.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// How long Ariakit waits before a hovercard shows.
const SHOW_TIMEOUT = 500;

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("closes the hovercard on Escape", async ({ page, q }) => {
    const section = q.region("Single");
    await hoverOver(query(section).link("Kai Tanaka"));
    await test.expect(q.dialog("Kai Tanaka")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Kai Tanaka")).toBeHidden();
  });

  test("closes the hovercard with the dismiss button", async ({ q }) => {
    const section = q.region("Single");
    await hoverOver(query(section).link("Kai Tanaka"));
    const dialog = q.dialog("Kai Tanaka");
    await test.expect(dialog).toBeVisible();
    await query(dialog).button("Dismiss popup").click();
    await test.expect(dialog).toBeHidden();
  });

  test("doesn't open the hovercard on focus", async ({ page, q }) => {
    const section = q.region("Shared");
    await tabTo(page, query(section).link("Noor Haddad"));
    await test.expect(query(section).link("Noor Haddad")).toBeFocused();
    // No state tracks a hovercard that doesn't show. Cross the show timeout,
    // then the frames that would render the hovercard.
    await page.waitForTimeout(SHOW_TIMEOUT);
    await flushFrames(page);
    // Focus doesn't move the anchor of the shared hovercard, so a hovercard
    // that opened anyway would show another person.
    await test.expect(q.dialog()).toHaveCount(0);
  });

  test("opens the hovercard from the keyboard with the disclosure", async ({
    page,
    q,
  }) => {
    const section = q.region("Disclosure");
    await tabTo(page, query(section).link("Noor Haddad"));
    // The disclosure stays visually hidden until the anchor takes keyboard
    // focus, and it comes next in the Tab order.
    const disclosure = query(section).button("More details about Noor Haddad");
    await page.keyboard.press("Tab");
    await test.expect(disclosure).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(q.dialog("Noor Haddad")).toBeVisible();
  });

  test("names a disclosure without children", async ({ page, q }) => {
    const section = q.region("Single");
    await tabTo(page, query(section).link("Kai Tanaka"));
    await page.keyboard.press("Tab");
    await test.expect(query(section).button("More details")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/8359#discussion_r4506959808
  test("names the buttons when their optional label is empty", async ({
    page,
    q,
  }) => {
    const section = q.region("Optional label");
    await tabTo(page, query(section).link("Lena Fischer"));
    await page.keyboard.press("Tab");
    await test.expect(query(section).button("More details")).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = q.dialog("Lena Fischer");
    await test.expect(dialog).toBeVisible();
    await test.expect(query(dialog).button("Dismiss popup")).toBeVisible();
  });

  test("doesn't slide with reduced motion", async ({ page, q }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const section = q.region("Shared");
    await hoverOver(query(section).link("Kai Tanaka"));
    await test.expect(q.dialog("Kai Tanaka")).toBeVisible();
    await query(section).link("Noor Haddad").hover();
    await test.expect(q.dialog("Noor Haddad")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });
});
