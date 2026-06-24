import { AxeBuilder } from "@axe-core/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
withFramework(import.meta.dirname, async ({ test }) => {
  test("exposes standalone TagRemove with visible text as a named button", async ({
    page,
    q,
  }) => {
    const removeButton = q.button("Remove React filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(removeButton).not.toHaveAttribute("aria-label");
    // Safari does not always tab-focus native buttons on macOS runners.
    await removeButton.focus();
    await test.expect(removeButton).toBeFocused();
    const tagRemove = page
      .locator('[aria-label="Press Delete or Backspace to remove"]')
      .first();
    await test.expect(tagRemove).toHaveAttribute("aria-hidden", "true");
    await test.expect(tagRemove.locator("svg")).toHaveCount(1);
    await test.expect(q.button("Remove React")).toHaveCount(0);
  });

  test("exposes standalone TagRemove with an aria-label", async ({
    page,
    q,
  }) => {
    const removeButton = q.button("Remove Vue filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test
      .expect(removeButton)
      .toHaveAttribute("aria-label", "Remove Vue filter");
    await test.expect(removeButton).toHaveText("x");
    await test.expect(q.button("Remove Vue")).toHaveCount(0);

    const results = await new AxeBuilder({ page })
      .withRules(["aria-hidden-focus"])
      .analyze();

    test.expect(results.violations).toHaveLength(0);
  });

  test("does not render a default icon outside a Tag", async ({ q }) => {
    const removeButton = q.button("Remove Angular filter");
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test
      .expect(removeButton)
      .toHaveAttribute("aria-label", "Remove Angular filter");
    await test.expect(removeButton.locator("svg")).toHaveCount(0);
  });

  test("preserves a standalone render element name", async ({ q }) => {
    const removeButton = q.button("Remove Svelte filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(removeButton).not.toHaveAttribute("aria-label");
    await test.expect(q.button("Remove Svelte")).toHaveCount(0);
  });

  test("preserves a standalone root labelledby name", async ({ q }) => {
    const removeButton = q.button("Remove Solid filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(removeButton).not.toHaveAttribute("aria-label");
    await test
      .expect(removeButton)
      .toHaveAttribute("aria-labelledby", "solid-label");
    await test.expect(removeButton).toHaveText("x");
    await test.expect(q.button("Remove Solid")).toHaveCount(0);
  });
});
