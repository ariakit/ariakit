import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { NavExamples } from "./pages/nav.react.tsx";

mountExamples(NavExamples);

test("marks only the link that matches the current URL", () => {
  const rows = q.within(q.navigation("Rows"));
  expect(rows.link("Installation")).toHaveAttribute("aria-current", "page");
  expect(rows.link("Overview")).not.toHaveAttribute("aria-current");
  expect(rows.link("Usage")).not.toHaveAttribute("aria-current");
  // A link to a part of the current page is not the current page.
  expect(rows.link("Options")).not.toHaveAttribute("aria-current");
  expect(rows.link("Roadmap")).toHaveAttribute("aria-disabled", "true");
  expect(rows.link("Roadmap")).not.toHaveAttribute("href");
});

test("opens the section that holds the current link", () => {
  const nav = q.within(q.navigation("Disclosures"));
  expect(nav.button("Getting started")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(nav.button("Styling")).toHaveAttribute("aria-expanded", "true");
  expect(nav.button("Composition")).toHaveAttribute("aria-expanded", "false");
  const current = q
    .navigation("Disclosures")
    .querySelector("[aria-current='page']");
  expect(current).toHaveAccessibleName("Introduction");
  expect(current).toHaveAttribute("href", "/docs/styling/introduction");
  expect(current).toBeVisible();
});

test("opens every section around a deep current link", () => {
  const nav = q.within(q.navigation("Nested disclosures"));
  expect(nav.button("Components")).toHaveAttribute("aria-expanded", "true");
  expect(nav.button("Forms")).toHaveAttribute("aria-expanded", "true");
  expect(nav.link("Checkbox")).toHaveAttribute("aria-current", "page");
  expect(nav.link("Checkbox")).toBeVisible();
});

test("moves the current page when a sidebar link is clicked", async () => {
  const sidebar = q.navigation("Documentation sections");
  const getCurrent = () => sidebar.querySelectorAll("[aria-current='page']");
  expect(getCurrent()).toHaveLength(1);
  expect(getCurrent()[0]).toHaveAttribute("href", "/docs/styling/introduction");
  const [quickstart] = q.within(sidebar).link.all("Quickstart");
  if (!quickstart) throw new Error("The sidebar has no Quickstart link");
  await click(quickstart);
  expect(getCurrent()).toHaveLength(1);
  expect(getCurrent()[0]).toHaveAttribute("href", "/docs/start/quickstart");
});
