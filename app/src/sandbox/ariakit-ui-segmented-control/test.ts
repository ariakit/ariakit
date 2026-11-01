import { focus, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows a tooltip when the pointer is on an icon-only segment", async () => {
  await hover(q.within(q.radiogroup("Icon only")).radio("Grid"));
  expect(await q.tooltip.wait("Grid")).toBeVisible();
});

test("shows the tooltip of the icon-only segment that takes keyboard focus", async () => {
  const segments = q.within(q.radiogroup("Icon only"));
  await focus(segments.radio("List"));
  await press.ArrowRight();
  expect(segments.radio("Grid")).toBeChecked();
  expect(await q.tooltip.wait("Grid")).toBeVisible();
});

test("selects the next segmented tab with an arrow key and shows its panel", async () => {
  await focus(q.tab("Overview"));
  await press.ArrowRight();
  expect(q.tab("Activity")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Activity")).toHaveTextContent("Recent changes");
});

test("renders the tabs of the tabs prop in a segmented list", () => {
  const list = q.within(q.tablist("Source"));
  expect(list.tab("Code")).toHaveAttribute("aria-selected", "true");
  expect(list.tab("Preview")).toBeInTheDocument();
});

test("renders plain links in a segmented button group", () => {
  const group = q.within(q.group("Pages"));
  expect(group.link("First")).toHaveAttribute("aria-current", "page");
});
