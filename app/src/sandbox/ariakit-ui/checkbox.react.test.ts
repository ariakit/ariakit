import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { CheckboxExamples } from "./pages/checkbox.react.tsx";

mountExamples(CheckboxExamples);

test("select all reflects and toggles its children", async () => {
  const box = q.within(q.article("Select all"));
  const parent = box.checkbox("All features");
  const children = q.within(box.group("Features"));

  expect(parent).toHaveAttribute("aria-checked", "mixed");
  expect(children.checkbox("Alerts")).toBeChecked();
  // The parent names the children it controls.
  const childIds = children.checkbox.all().map((child) => child.id);
  expect(parent.getAttribute("aria-controls")?.split(" ")).toEqual(childIds);

  await click(parent);
  expect(parent).toBeChecked();
  for (const child of children.checkbox.all()) {
    expect(child).toBeChecked();
  }

  await click(parent);
  expect(parent).not.toBeChecked();
  for (const child of children.checkbox.all()) {
    expect(child).not.toBeChecked();
  }

  await click(children.checkbox("Analytics"));
  expect(children.checkbox("Analytics")).toBeChecked();
  expect(parent).toHaveAttribute("aria-checked", "mixed");
});

test("a card grid is a named group of cards", async () => {
  const box = q.within(q.article("Card grid"));
  const grid = q.within(box.group("Features"));
  expect(grid.checkbox.all()).toHaveLength(4);
  expect(box.text("1 of 4 selected")).toBeInTheDocument();
  // The input is visually hidden, so a user clicks the card around it.
  await click(grid.text("Alerts"));
  expect(grid.checkbox("Alerts")).toBeChecked();
  expect(box.text("2 of 4 selected")).toBeInTheDocument();
});
