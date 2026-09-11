import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// A glider is the nav's aria-hidden first children, in the order the glider
// prop lists them. It has no role or name, so tests reach it by position.
function getGliders(nav: Locator) {
  return nav.locator(":scope > [aria-hidden='true']");
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
}

withFramework(
  import.meta.dirname,
  { route: "nav" },
  async ({ test, query }) => {
    // Poll the glider box against the row box: a glider is placed by CSS anchor
    // positioning, which settles after the row it follows.
    const expectToCover = async (glider: Locator, row: Locator) => {
      const rowBox = await getBox(row);
      await test.expect(glider).toBeVisible();
      await test.expect.poll(() => getBox(glider)).toEqual(rowBox);
    };

    test("fills the row with a button row", async ({ q }) => {
      const nav = q.navigation("Command row");
      const button = query(nav).button("Search ⌘K");
      const row = button.locator("xpath=..");
      const rowBox = await getBox(row);
      const buttonBox = await getBox(button);
      test.expect(buttonBox.width).toBe(rowBox.width);
      // The trailing shortcut reaches the end of the row, one control inset in.
      const shortcut = button.getByText("⌘K", { exact: true });
      const shortcutBox = await getBox(shortcut);
      test
        .expect(rowBox.x + rowBox.width - (shortcutBox.x + shortcutBox.width))
        .toBeLessThan(16);
    });

    test("shows the current and hover covers on rows of a nested section", async ({
      q,
    }) => {
      const nav = q.navigation("Nested disclosures");
      const rows = query(nav);
      const forms = rows.button("Forms");
      await test.expect(forms).toHaveAttribute("aria-expanded", "true");
      // The nested section's root sits in a content that stacks over the
      // gliders, so it must not paint a surface of its own over them.
      const nestedRoot = forms.locator("xpath=..");
      await test
        .expect(nestedRoot)
        .toHaveCSS("background-color", /^(rgba\(0, 0, 0, 0\)|.* \/ 0\))$/);

      const [hover, cover] = [getGliders(nav).nth(0), getGliders(nav).nth(1)];
      await expectToCover(cover, rows.link("Checkbox"));

      const radio = rows.link("Radio");
      await radio.scrollIntoViewIfNeeded();
      await radio.hover();
      await expectToCover(hover, radio);
    });

    test("follows the pointer and the keyboard in the sidebar", async ({
      page,
      q,
    }) => {
      const nav = q.navigation("Documentation sections");
      const rows = query(nav);
      const [hover, cover, focus] = [
        getGliders(nav).nth(0),
        getGliders(nav).nth(1),
        getGliders(nav).nth(2),
      ];
      const links = rows.link("Introduction");
      await expectToCover(cover, links.nth(1));
      await test.expect(hover).toBeHidden();

      const quickstart = rows.link("Quickstart").first();
      await quickstart.scrollIntoViewIfNeeded();
      await quickstart.hover();
      await expectToCover(hover, quickstart);

      const section = rows.button("Styling");
      await section.hover();
      await expectToCover(hover, section);

      await quickstart.click();
      await expectToCover(cover, quickstart);

      // The focus ring is drawn only while a row has keyboard focus.
      await test.expect(focus).toHaveCSS("outline-style", "none");
      // The second Introduction is the page's screenshot focus target, which
      // carries a tab index, so WebKit keeps it in sequential focus navigation
      // too. The round trip reaches it with a real Tab press, which is what
      // makes :focus-visible match.
      const target = links.nth(1);
      await target.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await test.expect(target).toBeFocused();
      await expectToCover(focus, target);
      await test.expect(focus).toHaveCSS("outline-style", "solid");
      await test.expect(focus).toHaveCSS("outline-width", "2px");
    });
  },
);
