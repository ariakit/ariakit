import { AxeBuilder } from "@axe-core/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
withFramework(import.meta.dirname, async ({ test }) => {
  test("exposes standalone TagRemove with visible text as a named button", async ({
    page,
    q,
  }) => {
    await q.textbox("Add filter").click();
    await page.keyboard.press("Tab");

    // The focused element is hidden before the fix, so accessible button
    // queries cannot observe it until after the aria-hidden assertion passes.
    const focusedElement = page.locator(":focus");
    await test.expect(focusedElement).toHaveText("Remove React filter");
    await test
      .expect(focusedElement)
      .not.toHaveAttribute("aria-hidden", "true");
    await test.expect(q.button("Remove React filter")).toBeFocused();
    await test
      .expect(
        page
          .locator('[aria-label="Press Delete or Backspace to remove"]')
          .first(),
      )
      .toHaveAttribute("aria-hidden", "true");
    await test.expect(q.button("Remove React")).toHaveCount(0);
  });

  test("labels an icon-only standalone TagRemove from its value", async ({
    page,
    q,
  }) => {
    const removeButton = q.button("Remove Vue");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");

    const results = await new AxeBuilder({ page })
      .withRules(["aria-hidden-focus"])
      .analyze();

    test.expect(results.violations).toHaveLength(0);
  });
});
