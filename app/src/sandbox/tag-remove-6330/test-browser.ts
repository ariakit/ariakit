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
    // Safari does not always tab-focus native buttons on macOS runners.
    await removeButton.focus();
    await test.expect(removeButton).toBeFocused();
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

  test("preserves a standalone render element name", async ({ q }) => {
    const removeButton = q.button("Remove Svelte filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(q.button("Remove Svelte")).toHaveCount(0);
  });

  test("labels an icon-only standalone render element from its value", async ({
    q,
  }) => {
    const removeButton = q.button("Remove Ember");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  });

  test("preserves a standalone render element image name", async ({ q }) => {
    const removeButton = q.button("Remove Preact filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(q.button("Remove Preact")).toHaveCount(0);
  });

  test("preserves a standalone render element labelledby name", async ({
    q,
  }) => {
    const removeButton = q.button("Remove Alpine filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(removeButton).not.toHaveAttribute("aria-label");
    await test.expect(q.button("Remove Alpine")).toHaveCount(0);
  });

  test("preserves a standalone root labelledby name", async ({ q }) => {
    const removeButton = q.button("Remove Solid filter");
    await test.expect(removeButton).toBeVisible();
    await test.expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
    await test.expect(removeButton).not.toHaveAttribute("aria-label");
    await test.expect(q.button("Remove Solid")).toHaveCount(0);
  });
});
