import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { NavFixturesExamples } from "./pages/nav-fixtures.react.tsx";

mountExamples(NavFixturesExamples);

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
test("omits a conditional navigation button without hiding its links", async () => {
  const fixture = q.within(q.article("Optional navigation headings"));
  const navigation = q.within(fixture.navigation("Workspace navigation"));
  expect(navigation.link("Workspace members")).toBeVisible();
  expect(navigation.link("Workspace settings")).toBeVisible();
  expect(navigation.button.all()).toHaveLength(0);

  await click(fixture.checkbox("Show navigation headings"));
  const button = navigation.button("Workspace pages");
  expect(button).toBeVisible();
  expect(navigation.button.all()).toHaveLength(1);
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(navigation.link.maybe("Workspace members")).not.toBeInTheDocument();
  await click(button);
  expect(navigation.link("Workspace members")).toBeVisible();
  expect(navigation.link("Workspace settings")).toBeVisible();
  await click(button);
  expect(navigation.link.maybe("Workspace members")).not.toBeInTheDocument();

  await click(fixture.checkbox("Show navigation headings"));
  expect(navigation.link("Workspace members")).toBeVisible();
  expect(navigation.link("Workspace settings")).toBeVisible();
  expect(navigation.button.all()).toHaveLength(0);
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
test("keeps zero as a navigation button label", async () => {
  const navigation = q.within(q.navigation("Invitation navigation"));
  const button = navigation.button("0");
  expect(button).toBeVisible();
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(navigation.link.maybe("Invitation settings")).not.toBeInTheDocument();
  await click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(navigation.link("Invitation settings")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584695
test("uses the explicit navigation button and content without extra controls", async () => {
  const navigation = q.within(q.navigation("Project navigation"));
  const button = navigation.button("Project pages");
  expect(button).toBeVisible();
  expect(navigation.button.all()).toHaveLength(1);
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(navigation.link.maybe("All projects")).not.toBeInTheDocument();

  await click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(navigation.link("All projects")).toBeVisible();
  expect(navigation.button.all()).toHaveLength(1);

  await click(button);
  expect(navigation.link.maybe("All projects")).not.toBeInTheDocument();
  expect(button).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
test("keeps a dialog closed when its navigation contains the current page", async () => {
  const fixture = q.within(q.article("Current page in a dialog"));
  const disclosure = fixture.button("Open navigation dialog");
  expect(disclosure).toHaveAttribute("aria-expanded", "false");
  // The dialog renders in a portal, outside the fixture.
  expect(q.dialog.maybe("Navigation dialog")).not.toBeInTheDocument();

  await click(disclosure);
  const dialog = q.within(q.dialog("Navigation dialog"));
  expect(q.dialog("Navigation dialog")).toBeVisible();
  expect(dialog.link("Documentation")).toHaveAttribute("aria-current", "page");

  await click(dialog.button("Close navigation dialog"));
  expect(q.dialog.maybe("Navigation dialog")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
test("opens the current page's navigation group across an unrelated provider", async () => {
  const fixture = q.within(q.article("Section across an unrelated provider"));
  expect(fixture.button("Account pages")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(fixture.link("Account overview")).toBeVisible();
  expect(fixture.button("Open account settings")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  // The dialog renders in a portal, outside the fixture.
  expect(q.dialog.maybe("Account settings")).not.toBeInTheDocument();

  await click(fixture.button("Open account settings"));
  expect(q.dialog("Account settings")).toBeVisible();
});
