import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3649284696
  test("names the input with the label rendered inside the popover", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();

    // The label reaches the input through `htmlFor` alone, so the browser's own
    // name computation is what proves the association.
    const input = q.combobox("Search fruits");
    await test.expect(input).toBeVisible();
    await test.expect(input).toBeFocused();

    // The label inside the popover doesn't take over the names the select label
    // owns.
    await test.expect(select).toBeVisible();
    await test.expect(q.listbox("Favorite fruit")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3649284696
  test("focuses the input when clicking the label inside the popover", async ({
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Apple")).toBeVisible();

    // Clicking a label focuses its control in the browser. Were the label bound
    // to the select outside the popover, this would pull focus out of it.
    await q.text("Search fruits").click();

    await test.expect(q.combobox("Search fruits")).toBeFocused();
    await test.expect(q.option("Apple")).toBeVisible();
  });
});
