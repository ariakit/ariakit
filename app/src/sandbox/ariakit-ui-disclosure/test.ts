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

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("keeps a consumer label component and description separate from the slots", async () => {
  const button = q.button("Workspace members");
  expect(button).toHaveAttribute("aria-labelledby", "workspace-members-label");
  expect(button).toHaveAccessibleDescription(
    "People with access to this workspace",
  );
  expect(button.children[2]).toHaveTextContent("4");
  await click(button);
  expect(q.text("Invite a teammate or change a role.")).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("accepts label props with fragment content and adjacent slots", async () => {
  const button = q.button("Invitation details");
  expect(button).toHaveAttribute("aria-labelledby", "invitation-label");
  expect(button).toHaveAccessibleDescription("Review workspace invitations");
  expect(button.children[2]).toHaveTextContent("2");
  await click(button);
  expect(q.text("Two invitations need review")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("renders a zero label and omits a false label without wrapping row children", async () => {
  const button = q.button("0", { description: "Pending invitations" });
  expect(button).toHaveAccessibleDescription("Pending invitations");
  await click(button);
  expect(q.text("No invitations need review")).toBeVisible();
  const members = q.button("Show invited members");
  expect(members).not.toHaveAttribute("aria-labelledby");
  expect(members).toHaveAccessibleDescription("Members waiting for access");
  expect(
    members.querySelectorAll(":scope > .disclosure-button-slot"),
  ).toHaveLength(1);
});
