import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const name of ["Project", "Team"]) {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async () => {
    expect(q.tabpanel(`${name} activity`)).toBeVisible();
    await click(q.tab(`${name} reviews`));
    expect(q.tabpanel(`${name} reviews`)).toBeVisible();
    expect(q.text(`${name} review updates`)).toBeVisible();
    await click(q.tab(`${name} activity`));
    expect(q.tabpanel(`${name} activity`)).toBeVisible();
    expect(q.text(`${name} activity updates`)).toBeVisible();
  });
}

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
test("preserves an explicit tabId on a single panel", async () => {
  const panel = q.tabpanel("Pinned activity");
  expect(panel).toBeVisible();
  await click(q.tab("Pinned reviews"));
  expect(q.tab("Pinned reviews")).toHaveAttribute("aria-selected", "true");
  expect(panel).not.toBeVisible();
  await click(q.tab("Pinned activity"));
  expect(q.tabpanel("Pinned activity")).toBeVisible();
});
