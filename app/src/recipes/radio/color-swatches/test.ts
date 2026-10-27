import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the color group with the picked color", async () => {
  expect(q.within(q.radiogroup("Color: Sage")).radio("Sage")).toBeChecked();
  // The swatches have no text, so the keyboard picks the next color.
  await press.Tab();
  expect(q.radio("Sage")).toHaveFocus();
  await press.ArrowRight();
  expect(q.within(q.radiogroup("Color: Navy")).radio("Navy")).toBeChecked();
});

test("tells that a size is sold out and adds the picked size", async () => {
  const sizes = q.within(q.radiogroup("Size"));
  const soldOut = sizes.radio("XL");
  expect(soldOut).toBeDisabled();
  expect(soldOut).toHaveAccessibleDescription("Sold out. Back on 20 November.");
  expect(q.button("Select a size")).toBeDisabled();
  await click(sizes.text("M"));
  expect(q.button("Add Sage jacket, size M")).toBeEnabled();
});

test("leaves the size group with one Tab press", async () => {
  await click(q.within(q.radiogroup("Size")).text("M"));
  expect(q.radio("M")).toHaveFocus();
  await press.Tab();
  expect(q.button("Add Sage jacket, size M")).toHaveFocus();
});

test("shows when a sold-out size comes back on hover", async () => {
  await hover(q.within(q.radiogroup("Size")).text("XL"));
  expect(await q.tooltip.wait("Sold out. Back on 20 November.")).toBeVisible();
});
