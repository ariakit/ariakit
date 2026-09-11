import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "input" },
  async ({ test, query }) => {
    test("tucks the default ring inside the border on keyboard focus", async ({
      page,
      q,
    }) => {
      const field = query(q.article("Default")).textbox("Full name");
      const next = query(q.article("Labeled field with hint")).textbox(
        "Display name",
      );
      await field.focus();
      await page.keyboard.press("Tab");
      await test.expect(next).toBeFocused();
      await test.expect(next).toHaveCSS("outline-style", "solid");
      await test.expect(next).toHaveCSS("outline-width", "2px");
      await test.expect(next).toHaveCSS("outline-offset", "-1px");
      await test.expect(field).toHaveCSS("outline-style", "none");
    });

    test("draws the thick ring on the field that asks for it", async ({
      q,
    }) => {
      const field = query(q.article("Thick focus ring")).textbox("Tag");
      await field.click();
      await test.expect(field).toBeFocused();
      await test.expect(field).toHaveCSS("outline-style", "solid");
      await test.expect(field).toHaveCSS("outline-width", "3px");
    });

    test("rings the wrapper when the input inside takes focus", async ({
      q,
    }) => {
      const input = query(q.article("Field with leading icon")).textbox(
        "Filter components",
      );
      const wrapper = input.locator("xpath=..");
      await input.click();
      await test.expect(input).toBeFocused();
      await test.expect(wrapper).toHaveCSS("outline-style", "solid");
      await test.expect(wrapper).toHaveCSS("outline-width", "2px");
      await test.expect(input).toHaveCSS("outline-style", "none");
    });

    // The wrapper is a div because it holds a button, so a label inside it
    // keeps click-to-focus on the prefix.
    test("focuses the share link from a click on its prefix", async ({ q }) => {
      const box = query(q.article("Share link with copy button"));
      const input = box.textbox("Share link");
      await box.text("https://").click();
      await test.expect(input).toBeFocused();
      await test
        .expect(box.button("Copy").locator("xpath=.."))
        .toHaveCSS("outline-style", "solid");
    });

    test("rings the search trigger on a click", async ({ q }) => {
      const trigger = query(q.article("Search trigger")).button("Search docs");
      await trigger.click();
      await test.expect(trigger).toBeFocused();
      await test.expect(trigger).toHaveCSS("outline-style", "solid");
    });
  },
);
