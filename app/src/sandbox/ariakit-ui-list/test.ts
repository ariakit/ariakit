import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
test("keeps a disclosure badge beside the label without a description", async () => {
  const button = q.button("Project tasks 3");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  await click(button);
  expect(q.text("Manage project tasks")).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("keeps a disclosure badge beside a consumer label component with a description", async () => {
  const button = q.button("Team tasks");
  expect(button).toHaveAttribute("aria-labelledby", "list-tasks-label");
  expect(button).toHaveAccessibleDescription("All tasks in this workspace");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  await click(button);
  expect(q.text("Manage team tasks")).not.toBeVisible();
});
// The checked marker remains part of a plain disclosure label when a
// description supplies separate name and description relationships.
test("keeps a disclosure step's checked state in its name", () => {
  const button = q.button("Checked Connect the repository");
  expect(button).toHaveAccessibleDescription("Done on Monday");
});
