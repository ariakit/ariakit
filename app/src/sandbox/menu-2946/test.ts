import { click, focus, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
test("focuses a conditionally mounted menu that opens by default", async () => {
  await click(q.button("Add item"));

  const menu = q.menu("Actions for new item");
  expect(menu).toBeVisible();
  expect(menu).toHaveFocus();
  expect(q.menuitem("Rename")).not.toHaveAttribute("data-active-item");
});

test("respects autofocus opt-out when mounting open", async () => {
  await click(q.button("Add passive item"));

  expect(q.menu("Actions for new item")).toBeVisible();
  expect(document.body).toHaveFocus();
  expect(q.text("Store autofocus: disabled")).toBeVisible();
});

test("preserves modal menu item focus when mounting open", async () => {
  await click(q.button("Add modal item"));

  const item = q.menuitem("Rename");
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
});

test("focuses a conditionally mounted controlled-open menu", async () => {
  await click(q.button("Add controlled item"));

  expect(q.menu("Actions for new item")).toHaveFocus();
});

test("focuses a conditionally mounted menu created with useMenu", async () => {
  await click(q.button("Add hook item"));

  expect(q.menu("Hook actions")).toHaveFocus();
});

test("does not refocus an open menu when its store is replaced", async () => {
  await click(q.button("Add related item"));
  await focus(q.menuitem("Change parent"));
  await click(q.menuitem("Change parent"));

  expect(q.menuitem("Parent changed")).toHaveFocus();
});

test("does not autofocus a menu opened after mounting", async () => {
  await click(q.button("Add deferred item"));
  const button = q.button("Show deferred actions");
  await focus(button);
  await click(button);

  expect(q.menuitem("Archive")).toBeVisible();
  expect(q.menu()).not.toHaveFocus();
  expect(q.menuitem("Archive")).not.toHaveFocus();
});

test("does not autofocus after closing before passive effects", async () => {
  await click(q.button("Add initially hidden item"));
  const button = q.button("Show initially hidden actions");
  await focus(button);
  await click(button);

  expect(q.menuitem("Download")).toBeVisible();
  expect(q.menu()).not.toHaveFocus();
  expect(q.menuitem("Download")).not.toHaveFocus();
});

test("does not autofocus a lazily rendered menu", async () => {
  await click(q.button("Add lazy item"));
  const button = q.button("Show lazy actions");
  await focus(button);
  await click(button);

  expect(q.menuitem("Export")).toBeVisible();
  expect(q.menu()).not.toHaveFocus();
  expect(q.menuitem("Export")).not.toHaveFocus();
});

test("does not autofocus a default-open menu rendered after its store commits", async () => {
  await click(q.button("Add late default-open item"));
  const button = q.button("Render default-open actions");
  await focus(button);
  await click(button);

  expect(q.menuitem("Move")).toBeVisible();
  expect(q.menu("Late actions")).not.toHaveFocus();
  expect(q.menuitem("Move")).not.toHaveFocus();
});

test("does not autofocus a controlled-open menu rendered after its store commits", async () => {
  await click(q.button("Add late controlled item"));
  const button = q.button("Render controlled actions");
  await focus(button);
  await click(button);

  expect(q.menuitem("Publish")).toBeVisible();
  expect(q.menu("Late controlled actions")).not.toHaveFocus();
  expect(q.menuitem("Publish")).not.toHaveFocus();
});
