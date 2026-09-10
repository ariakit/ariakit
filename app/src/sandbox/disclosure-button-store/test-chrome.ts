import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781692
    test(`keeps the ${name.toLowerCase()} button state in sync with its explicit store`, async ({
      q,
    }) => {
      const button = q.button(`${name} details`);
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await test.expect(button).not.toHaveAttribute("data-open");
      await button.click();
      await test.expect(button).toHaveAttribute("aria-expanded", "true");
      await test.expect(button).toHaveAttribute("data-open", "true");
      await test.expect(q.text(`${name} details are available.`)).toBeVisible();
      await button.click();
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await test.expect(button).not.toHaveAttribute("data-open");
      await test
        .expect(q.text(`${name} details are available.`))
        .not.toBeVisible();
    });
  }
});
