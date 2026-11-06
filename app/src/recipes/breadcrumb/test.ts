import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("marks the page as text and links to the levels above", () => {
  const trail = q.within(q.navigation("Breadcrumb"));
  expect(trail.link("Home")).toHaveAttribute("href", "#home");
  expect(trail.link("Garden")).toHaveAttribute("href", "#garden");
  expect(trail.link("Tools")).toHaveAttribute("href", "#tools");
  expect(trail.link.maybe("Pruning shears")).not.toBeInTheDocument();
  expect(trail.text("Pruning shears")).toHaveAttribute("aria-current", "page");
});

test("keeps the separators out of the list", () => {
  const trail = q.within(q.navigation("Breadcrumb"));
  expect(trail.listitem.all()).toHaveLength(4);
});

test("puts a hidden separator before each step after the first", () => {
  const steps = q.within(q.navigation("Breadcrumb")).listitem.all();
  expect(steps[0]?.previousElementSibling).toBeNull();
  for (const step of steps.slice(1)) {
    expect(step.previousElementSibling).toHaveAttribute("aria-hidden", "true");
  }
});

test("stops only on the links when tabbing", async () => {
  await press.Tab();
  expect(q.link("Home")).toHaveFocus();
  await press.Tab();
  expect(q.link("Garden")).toHaveFocus();
  await press.Tab();
  expect(q.link("Tools")).toHaveFocus();
  await press.Tab();
  expect(q.text("Pruning shears")).not.toHaveFocus();
});
