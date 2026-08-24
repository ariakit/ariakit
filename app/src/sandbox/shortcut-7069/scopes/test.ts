import { click, focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

function modKeyOptions() {
  const applePlatform = /mac|iphone|ipad|ipod/i.test(navigator.platform);
  return applePlatform ? { metaKey: true } : { ctrlKey: true };
}

function scopedShortcuts(label: string) {
  const group = q.labeled(label);
  return Array.from(group.querySelectorAll<HTMLElement>(".ns-scope-shortcut"));
}

// https://github.com/ariakit/ariakit/issues/7069
test("routes shared keys to the focused lane", async () => {
  await focus(q.region("Inbox"));
  const inboxHints = scopedShortcuts("Inbox shortcuts");
  const weekHints = scopedShortcuts("This week shortcuts");
  expect(inboxHints).toHaveLength(2);
  expect(inboxHints[0]).toHaveAttribute("data-in-scope");
  expect(weekHints[0]).not.toHaveAttribute("data-in-scope");

  await press("n");
  expect(q.button(/Untitled inbox task 4/)).toBeVisible();
  expect(q.button.maybe(/Untitled this week task 4/)).not.toBeInTheDocument();

  await focus(q.region("This week"));
  await press("n");
  expect(q.button(/Untitled this week task 4/)).toBeVisible();
  expect(inboxHints[0]).not.toHaveAttribute("data-in-scope");
  expect(weekHints[0]).toHaveAttribute("data-in-scope");
});

// https://github.com/ariakit/ariakit/issues/7069
test("gives the deepest nested scope priority", async () => {
  const routes = q.toolbar("Inbox capture routes");
  await focus(routes);
  expect(routes).toHaveFocus();
  expect(routes).toHaveAttribute("aria-activedescendant", "quick-note-route");
  expect(q.button("Quick note")).toHaveAttribute("data-active-item");
  expect(q.button("Quick note")).toHaveAttribute("data-in-scope");
  // The preceding test ends with N inside the dispatcher's same-task window.
  await sleep();
  await press("n");

  expect(q.button.maybe(/Untitled inbox task 4/)).not.toBeInTheDocument();
  expect(q.status("Activity")).toHaveTextContent(
    /Captured a quick note by keyboard\./,
  );
  expect(q.status("Quick captures")).toHaveTextContent(
    /1\s*captured · 1 proxied/,
  );

  await press.ArrowRight();
  expect(routes).toHaveAttribute("aria-activedescendant", "inbox-task-route");
  expect(q.button("Inbox task")).toHaveAttribute("data-active-item");
  await press("n");
  expect(q.button(/Untitled inbox task 4/)).toBeVisible();
  expect(q.status("Quick captures")).toHaveTextContent(
    /1\s*captured · 1 proxied/,
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("supports alternative keys and explicit scope arrays", async () => {
  await focus(q.button(/Map onboarding gaps/));
  await press.Delete();
  expect(q.button.maybe(/Map onboarding gaps/)).not.toBeInTheDocument();

  await focus(q.button(/Prototype search states/));
  await press.Backspace();
  expect(q.button.maybe(/Prototype search states/)).not.toBeInTheDocument();

  await focus(q.region("This week"));
  await press.Enter(null, modKeyOptions());
  expect(q.status("Activity")).toHaveTextContent(
    /Started a review for the active lane\./,
  );
  expect(q.status("Reviews")).toHaveTextContent(/1\s*Reviews/);
});

// https://github.com/ariakit/ariakit/issues/7069
test("keeps a portalled menu in its owner scope", async () => {
  await click(q.button("Inbox lane actions"));
  const menu = q.menu("Inbox lane actions");
  expect(menu).toBeVisible();
  expect(menu).toHaveFocus();

  await press("n");
  expect(q.button(/Untitled inbox task 4/)).toBeVisible();
  expect(q.status("Activity")).toHaveTextContent(
    /Added a task to Inbox by keyboard\./,
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("lets a disabled nested provider fall through to its parent", async () => {
  await click(q.button("Inbox lane actions"));
  await click(q.menuitem(/Quick edit Inbox task/));
  const dialog = q.dialog("Tune the task");
  const dialogQuery = q.within(dialog);
  expect(dialog).toBeVisible();
  const title = q.textbox("Task title");
  expect(title).toHaveFocus();
  expect(q.button("Save task")).toBeVisible();

  await press("s", null, modKeyOptions());
  expect(q.status("Quick edit saves")).toHaveTextContent(/1/);
  expect(dialogQuery.status("Workspace saves")).toHaveTextContent(
    /0\s*Workspace saves/,
  );

  await click(q.checkbox(/^Use dialog shortcuts/));
  await focus(title);
  // Identical synthetic key events share a zero-delay de-duplication window.
  await sleep();
  await press("s", null, modKeyOptions());
  expect(q.status("Quick edit saves")).toHaveTextContent(/1/);
  expect(dialogQuery.status("Workspace saves")).toHaveTextContent(
    /1\s*Workspace saves/,
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("keeps global help and the always-visible guide available", async () => {
  await focus(q.region("Inbox"));
  await press("?", null, { shiftKey: true });

  expect(q.text("Help is open")).toBeVisible();
  expect(q.text("New inbox task")).toBeVisible();
  expect(q.text("Save workspace")).toBeVisible();
});
