import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "combobox" },
  async ({ test, query }) => {
    test("filters, completes inline and closes on Enter", async ({ q }) => {
      const input = q.combobox("Destination");
      await input.click();
      const list = q.listbox("Destination");
      await test.expect(list).toBeVisible();
      // The popover renders in a portal, outside the box.
      await test
        .expect(query(q.article("Default")).listbox("Destination"))
        .toHaveCount(0);
      await input.pressSequentially("Den");
      await test.expect(input).toHaveValue("Denmark");
      await test.expect(query(list).option()).toHaveCount(1);
      await input.press("Enter");
      await test.expect(list).toBeHidden();
      await test.expect(input).toHaveValue("Denmark");
    });

    test("shows the empty state when nothing matches", async ({ q }) => {
      const input = q.combobox("Destination");
      await input.click();
      await input.pressSequentially("xyz");
      const list = q.listbox("Destination");
      await test.expect(query(list).option()).toHaveCount(0);
      await test.expect(query(list).text("No results found")).toBeVisible();
    });
  },
);
