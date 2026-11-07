import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("gives a classic carousel the carousel and slide semantics", async () => {
  const region = q.region("Projects");
  expect(region).toHaveAttribute("aria-roledescription", "carousel");
  const slides = q.within(region);
  const first = await slides.group.wait("1 of 7");
  expect(first).toHaveAttribute("aria-roledescription", "slide");
  expect(slides.group("7 of 7")).toBeInTheDocument();
  expect(slides.tablist("Slides")).toBeInTheDocument();
  expect(slides.tab("Slide 1")).toHaveAttribute("aria-selected", "true");
  expect(slides.tab("Slide 1")).toHaveAttribute("aria-controls", first.id);
  // The carousel starts at its first slide. The end needs a layout, which the
  // browser tests cover.
  expect(slides.button("Previous slide")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(slides.button("Next slide")).toBeInTheDocument();
});

test("adds no carousel semantics to a row", () => {
  const box = q.within(q.article("Filter row"));
  expect(box.toolbar("Filters")).toBeInTheDocument();
  expect(box.region.maybe()).not.toBeInTheDocument();
  expect(box.group.maybe()).not.toBeInTheDocument();
  expect(box.button("Scroll backward")).toBeInTheDocument();
  expect(box.button("Scroll forward")).toBeInTheDocument();
  // The buttons sit beside the toolbar, not in it.
  expect(
    q.within(box.toolbar("Filters")).button.maybe("Scroll forward"),
  ).not.toBeInTheDocument();
});

test("renders no buttons in a row without buttons", () => {
  const rows = [
    ["Row without buttons", "Filters without buttons"],
    ["Row with buttons set to none", "Filters with buttons set to none"],
    [
      "Row from a style recipe without buttons",
      "Filters from a style recipe without buttons",
    ],
  ] as const;
  for (const [title, label] of rows) {
    const box = q.within(q.article(title));
    expect(box.toolbar(label)).toBeInTheDocument();
    expect(box.button.maybe("Scroll backward")).not.toBeInTheDocument();
    expect(box.button.maybe("Scroll forward")).not.toBeInTheDocument();
  }
});
