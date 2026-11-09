import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("stops and starts autoplay with the play button", async () => {
  const carousel = q.within(q.region("Projects"));
  const status = q.region("Projects").querySelector("[aria-live]");
  expect(status).toHaveAttribute("aria-live", "off");
  await click(carousel.button("Stop automatic slide show"));
  expect(carousel.button("Start automatic slide show")).toBeInTheDocument();
  expect(status).toHaveAttribute("aria-live", "polite");
  await click(carousel.button("Start automatic slide show"));
  expect(carousel.button("Stop automatic slide show")).toBeInTheDocument();
  expect(status).toHaveAttribute("aria-live", "off");
});

test("puts the play button first in the Tab order", async () => {
  const carousel = q.within(q.region("Projects"));
  await press.Tab();
  expect(carousel.button("Stop automatic slide show")).toHaveFocus();
  await press.Tab();
  expect(carousel.button("Previous slide")).toHaveFocus();
});

test("plays when autoplay turns on after a move while it was off", async () => {
  const carousel = q.within(q.region("People"));
  await click(q.checkbox("Autoplay"));
  await click(carousel.button("Next slide"));
  await click(q.checkbox("Autoplay"));
  expect(carousel.button("Stop automatic slide show")).toBeInTheDocument();
});

test("stops after a press on the tab of the slide that shows", async () => {
  const carousel = q.within(q.region("People"));
  expect(carousel.tab("Slide 1")).toHaveAttribute("aria-selected", "true");
  await click(carousel.tab("Slide 1"));
  expect(carousel.button("Start automatic slide show")).toBeInTheDocument();
});

test("renders the lazy slides of a row at once", () => {
  const row = q.within(q.group("Tags"));
  expect(row.heading("Design")).toBeInTheDocument();
  expect(row.heading("Docs")).toBeInTheDocument();
});

test("speaks the slide position while focus pauses autoplay", async () => {
  const region = q.region("Previews");
  const status = region.querySelector("[aria-live]");
  expect(status).toHaveAttribute("aria-live", "off");
  await focus(q.within(region).button("Previous slide"));
  await expect.poll(() => status?.getAttribute("aria-live")).toBe("polite");
  await focus(q.button("Outside"));
  await expect.poll(() => status?.getAttribute("aria-live")).toBe("off");
});
