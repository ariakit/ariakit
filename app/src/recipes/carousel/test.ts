import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the carousel and its slides", async () => {
  const carousel = q.region("Tips");
  expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  const slides = q.within(carousel);
  await slides.group.wait("1 of 5");
  expect(slides.group("5 of 5")).toHaveAttribute(
    "aria-roledescription",
    "slide",
  );
  expect(slides.tab.all()).toHaveLength(5);
  expect(slides.tab("Slide 1")).toHaveAttribute("aria-selected", "true");
});
