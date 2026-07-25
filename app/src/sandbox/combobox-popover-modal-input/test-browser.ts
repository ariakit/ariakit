import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3649287442
  test("closes the modal popover with Escape from the input inside it", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();

    const input = q.combobox("Search fruits");
    await test.expect(input).toBeFocused();
    await test.expect(q.option("Apple")).toBeVisible();

    await input.press("Escape");

    await test.expect(input).toBeHidden();
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(select).toBeFocused();
  });

  test("keeps the combobox select interactive while the rest is inert", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();

    const input = q.combobox("Search fruits");
    await test.expect(input).toBeFocused();
    await test.expect(q.button("Outside")).toHaveAttribute("inert", "");
    await test.expect(select).not.toHaveAttribute("inert");

    // The browser refuses focus on inert content, so focus stays in the popover
    // even when something tries to move it outside.
    await q.button("Outside").focus();
    await test.expect(input).toBeFocused();

    // The select is a persistent element of the modal context, so it keeps
    // toggling the popover instead of being blocked by it.
    await select.click();

    await test.expect(input).toBeHidden();
    await test.expect(q.button("Outside")).not.toHaveAttribute("inert");
  });
});
