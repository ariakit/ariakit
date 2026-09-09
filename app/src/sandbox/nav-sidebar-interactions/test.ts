import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

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
  const disclosure = q.button("Open navigation dialog");
  expect(disclosure).toHaveAttribute("aria-expanded", "false");
  expect(q.dialog.maybe("Navigation dialog")).not.toBeInTheDocument();

  await click(disclosure);
  expect(q.dialog("Navigation dialog")).toBeVisible();
  expect(q.link("Documentation")).toHaveAttribute("aria-current", "page");

  await click(q.button("Close navigation dialog"));
  expect(q.dialog.maybe("Navigation dialog")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
test("opens the current page's navigation group across an unrelated provider", async () => {
  expect(q.button("Account pages")).toHaveAttribute("aria-expanded", "true");
  expect(q.link("Account overview")).toBeVisible();
  expect(q.button("Open account settings")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(q.dialog.maybe("Account settings")).not.toBeInTheDocument();

  await click(q.button("Open account settings"));
  expect(q.dialog("Account settings")).toBeVisible();
});
