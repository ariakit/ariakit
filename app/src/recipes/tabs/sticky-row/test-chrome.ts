import { getBoxOffset } from "#app/sandbox/ariakit-ui-glider/test-helpers.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The frame of the sticky row covers the edge of the panels, where their
  // focus ring would be, so the Tab key reaches the title, not the panel.
  test("moves the focus from the new note button to the title of the note", async ({
    page,
    q,
  }) => {
    await q.tab("Workshop").click();
    await q.button("New note").focus();
    await page.keyboard.press("Tab");
    await test
      .expect(query(q.tabpanel("Workshop")).textbox("Title"))
      .toBeFocused();
  });

  test("renames the tab of a note with its title", async ({ q }) => {
    await query(q.tabpanel("Trip")).textbox("Title").fill("Holiday");
    await test
      .expect(q.tab("Holiday"))
      .toHaveAttribute("aria-selected", "true");
    // The tab names its panel, so the panel takes the new name too.
    await query(q.tabpanel("Holiday")).textbox("Title").fill("");
    await test.expect(q.tab("Untitled")).toBeVisible();
  });

  test("names the action of the sidebar button in its tooltip and keeps the button name", async ({
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    await toggle.hover();
    await test.expect(q.tooltip("Open sidebar")).toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.tooltip("Close sidebar")).toBeVisible();
  });

  test("shows the name of the new note button in its tooltip", async ({
    q,
  }) => {
    await q.button("New note").hover();
    await test.expect(q.tooltip("New note")).toBeVisible();
  });

  test("reaches the toggle button, the tabs, and the new note button with the Tab key in reading order", async ({
    page,
    q,
  }) => {
    await q.button("Toggle sidebar").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.tab("Trip")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("New note")).toBeFocused();
  });

  test("moves a note with the keyboard and keeps the folder of the glider on it", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Trip");
    await tab.click();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowRight");
    await test.expect
      .poll(() => q.tab().allTextContents())
      .toEqual(["Workshop", "Trip", "Groceries"]);
    await test.expect(tab).toBeFocused();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
  });
});
