import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders the buttons of the row outside the tab list", () => {
  const list = q.within(q.tablist("Document"));
  expect(q.tab.all()).toHaveLength(3);
  for (const name of ["Outline", "Smaller text", "Larger text"]) {
    expect(q.button(name)).toBeInTheDocument();
    expect(list.button.maybe(name)).not.toBeInTheDocument();
  }
});

test("moves between tabs only with the arrow keys", async () => {
  await click(q.tab("Brief"));
  await press.ArrowLeft();
  expect(q.tab("Feedback")).toHaveFocus();
  await press.ArrowRight();
  expect(q.tab("Brief")).toHaveFocus();
});

test("shows the outline of the selected tab", async () => {
  const outline = q.button("Outline");
  expect(outline).toHaveAttribute("aria-expanded", "false");
  expect(q.text("Audience")).not.toBeVisible();
  await click(outline);
  expect(outline).toHaveAttribute("aria-expanded", "true");
  expect(q.text("Audience")).toBeVisible();
  await click(q.tab("Notes"));
  expect(q.text("Paper")).toBeVisible();
  // The press on a button of the row doesn't change the selected tab.
  expect(q.tab("Notes")).toHaveAttribute("aria-selected", "true");
});

test("disables a text size button at its limit and keeps its focus", async () => {
  const larger = q.button("Larger text");
  await click(larger);
  expect(larger).toHaveAttribute("aria-disabled", "true");
  expect(larger).toHaveFocus();
  await click(q.button("Smaller text"));
  expect(larger).not.toHaveAttribute("aria-disabled", "true");
});
