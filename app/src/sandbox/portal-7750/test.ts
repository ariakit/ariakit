import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7750
test("keeps the portal element in its place when the prop changes to null and back", async () => {
  const workspace = q.within(q.region("Workspace"));
  expect(q.within(workspace.group("Dock")).text("Notes")).toBeVisible();

  await click(q.button("Undock notes"));
  expect(q.button("Dock notes")).toBeVisible();
  // The notes move to the default portal node, outside the workspace. The dock
  // is an element of the app, so it stays in the workspace.
  expect(q.text("Notes")).toBeVisible();
  expect(workspace.text.maybe("Notes")).not.toBeInTheDocument();
  expect(workspace.group("Dock")).toBeVisible();

  await click(q.button("Dock notes"));
  expect(q.button("Undock notes")).toBeVisible();
  expect(q.within(workspace.group("Dock")).text("Notes")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7750
test("lets the app remove the portal element after the prop changed to null", async () => {
  await click(q.button("Undock notes"));
  expect(q.button("Dock notes")).toBeVisible();

  await click(q.button("Remove dock"));
  // React removes the dock from the workspace. The workspace still renders, and
  // the notes stay in the default portal node.
  expect(q.button("Dock notes")).toBeVisible();
  expect(q.text("Notes")).toBeVisible();
  expect(q.group.maybe("Dock")).not.toBeInTheDocument();
});
