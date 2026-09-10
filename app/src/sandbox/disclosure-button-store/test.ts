import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const name of ["Project", "Team"]) {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781692
  test(`keeps the ${name.toLowerCase()} button state in sync with its explicit store`, async () => {
    const button = q.button(`${name} details`);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("data-open");
    await click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("data-open", "true");
    expect(q.text(`${name} details are available.`)).toBeVisible();
    await click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("data-open");
    expect(q.text(`${name} details are available.`)).not.toBeVisible();
  });
}
