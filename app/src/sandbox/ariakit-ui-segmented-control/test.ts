import { click, focus, hover, press, q } from "@ariakit/test";
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

// https://github.com/ariakit/ariakit/issues/8325
// https://github.com/ariakit/ariakit/issues/8326
// https://github.com/ariakit/ariakit/issues/8327
test("renders the scroll buttons outside the elements with the group roles", () => {
  const groups = [
    {
      group: q.radiogroup("Narrow"),
      labels: ["Scroll backward", "Scroll forward"],
    },
    {
      group: q.tablist("Narrow period"),
      labels: ["Previous tabs", "Next tabs"],
    },
    {
      group: q.group("Narrow pages"),
      labels: ["Scroll backward", "Scroll forward"],
    },
    {
      group: q.navigation("Narrow range"),
      labels: ["Scroll backward", "Scroll forward"],
    },
  ];
  for (const { group, labels } of groups) {
    const root = group.parentElement;
    expect(root).not.toBeNull();
    for (const label of labels) {
      expect(q.within(root).button(label)).toBeInTheDocument();
      expect(q.within(group).button.maybe(label)).not.toBeInTheDocument();
    }
  }
});

// The root of a row paints its surface and holds its buttons, so it hides with
// the element that scrolls.
test("hides the scroll buttons of a hidden row", async () => {
  const example = q.within(q.article("Hidden"));
  const labels = [
    "Scroll backward",
    "Scroll forward",
    "Previous tabs",
    "Next tabs",
  ];
  const countButtons = () =>
    labels.flatMap((label) => example.button.all(label)).length;
  expect(countButtons()).toBe(10);
  await click(example.button("Hide the rows"));
  expect(countButtons()).toBe(0);
});
