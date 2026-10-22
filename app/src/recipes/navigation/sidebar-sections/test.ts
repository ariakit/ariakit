import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("opens one section at a time", async () => {
  const nav = q.within(q.navigation("Site"));
  expect(nav.button("Components")).toHaveAttribute("aria-expanded", "true");
  expect(nav.button("Examples")).toHaveAttribute("aria-expanded", "false");
  await click(nav.button("Examples"));
  expect(nav.button("Examples")).toHaveAttribute("aria-expanded", "true");
  expect(nav.button("Components")).toHaveAttribute("aria-expanded", "false");
  expect(nav.link("Skeleton")).toBeVisible();
  await click(nav.button("Examples"));
  expect(nav.button("Examples")).toHaveAttribute("aria-expanded", "false");
});

test("names a link by its label and describes it by its count", async () => {
  const nav = q.within(q.navigation("Site"));
  const link = nav.link("Combobox");
  expect(link).toHaveAttribute("aria-current", "page");
  expect(link).toHaveAccessibleDescription("12 examples");
  await click(nav.link("Dialog"));
  expect(nav.link("Dialog")).toHaveAttribute("aria-current", "page");
  expect(q.heading("Dialog")).toBeInTheDocument();
});
