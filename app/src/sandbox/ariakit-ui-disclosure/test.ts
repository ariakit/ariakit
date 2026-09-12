import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7478
test("keeps a trailing badge beside the label", async () => {
  const button = q.button("Notifications 3");
  expect(button.children[1]).toHaveTextContent("3");
  await click(button);
  expect(q.text("Three messages need your attention.")).not.toBeVisible();
  await press.Enter();
  expect(q.text("Three messages need your attention.")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7478
test("keeps a custom label and description separate from the slots", async () => {
  const button = q.button("Workspace members");
  expect(button).toHaveAttribute("aria-labelledby", "workspace-members-label");
  expect(button).toHaveAccessibleDescription(
    "People with access to this workspace",
  );
  expect(button.children[2]).toHaveTextContent("4");
  await click(button);
  expect(q.text("Invite a teammate or change a role.")).not.toBeVisible();
});
