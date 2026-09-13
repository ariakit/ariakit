import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
test("keeps a disclosure badge beside the label without a description", async () => {
  const button = q.button("Project pages 3");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  const link = q.link("Manage project pages");
  await click(button);
  expect(link).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("keeps a disclosure badge beside a consumer label component with a description", async () => {
  const button = q.button("Team pages");
  expect(button).toHaveAttribute("aria-labelledby", "nav-pages-label");
  expect(button).toHaveAccessibleDescription("All pages in this workspace");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  const link = q.link("Manage team pages");
  await click(button);
  expect(link).not.toBeVisible();
});
