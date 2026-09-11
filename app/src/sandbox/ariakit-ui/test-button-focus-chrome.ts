import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Tabs into a box the way a person does: a click on the box title sets the
 * point where sequential navigation starts, and Tab moves to the next stop. A
 * Tab press is what makes :focus-visible match.
 */
async function tabInto(page: Page, title: Locator) {
  await title.click();
  await page.keyboard.press("Tab");
}

withFramework(
  import.meta.dirname,
  { route: "button" },
  async ({ test, query }) => {
    for (const { title, name, width, offset } of [
      { title: "Default", name: "Cancel", width: "2px", offset: "1px" },
      { title: "Thin focus ring", name: "Rename", width: "1px", offset: "1px" },
      { title: "Thick focus ring", name: "Move", width: "3px", offset: "1px" },
      {
        title: "Offset focus ring",
        name: "Share",
        width: "2px",
        offset: "2px",
      },
    ]) {
      test(`${title.toLowerCase()}: the ring shows on keyboard focus`, async ({
        page,
        q,
      }) => {
        const box = query(q.article(title));
        const button = box.button(name);
        await test.expect(button).toHaveCSS("outline-style", "none");
        await tabInto(page, box.heading(title));
        await test.expect(button).toBeFocused();
        await test.expect(button).toHaveCSS("outline-style", "solid");
        await test.expect(button).toHaveCSS("outline-width", width);
        await test.expect(button).toHaveCSS("outline-offset", offset);
      });
    }

    test("a highlighted button fills with the brand color on focus", async ({
      page,
      q,
    }) => {
      const box = query(q.article("Highlighted focus"));
      const button = box.button("Open");
      const resting = await button.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      );
      await tabInto(page, box.heading("Highlighted focus"));
      await test.expect(button).toBeFocused();
      await test.expect(button).toHaveCSS("outline-style", "none");
      await test.expect(button).not.toHaveCSS("background-color", resting);
    });

    test("a focusable disabled button stays in the tab order", async ({
      page,
      q,
    }) => {
      const focusable = query(q.article("Focusable disabled"));
      const button = focusable.button("Export");
      await test.expect(button).toHaveAttribute("aria-disabled", "true");
      await test.expect(button).not.toHaveAttribute("disabled");
      await tabInto(page, focusable.heading("Focusable disabled"));
      await test.expect(button).toBeFocused();

      // A natively disabled button is not a stop, so Tab passes it by.
      const native = query(q.article("Disabled bevel"));
      await tabInto(page, native.heading("Disabled bevel"));
      await test.expect(native.button("Archive")).not.toBeFocused();
      await test.expect(page.locator("main :focus")).toHaveCount(1);
    });
  },
);
