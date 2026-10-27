import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names a group by its label and starts from its default value", async () => {
  const group = q.within(q.radiogroup("Plan"));
  expect(group.radio("Pro")).toBeChecked();
  await click(group.radio("Hobby"));
  expect(group.radio("Hobby")).toBeChecked();
  expect(group.radio("Pro")).not.toBeChecked();
});

test("names a group by aria-label over its label", () => {
  const group = q.within(q.radiogroup("Color theme"));
  expect(group.radio("Light")).toBeChecked();
  expect(q.radiogroup.maybe("Theme")).not.toBeInTheDocument();
});

test("controls a group through value and setValue", async () => {
  const group = q.within(q.radiogroup("Size"));
  expect(group.radio("Medium")).toBeChecked();
  await click(group.radio("Large"));
  expect(q.text("Selected size: l")).toBeInTheDocument();
  expect(group.radio("Large")).toBeChecked();
  await click(q.button("Reset size"));
  expect(group.radio("Small")).toBeChecked();
});

test("names a group by a fragment label", () => {
  const group = q.within(q.radiogroup("Notifications (optional)"));
  expect(group.radio("Email")).toBeChecked();
});

test("labels a card grid synced with a store prop", async () => {
  const grid = q.within(q.radiogroup("Billing"));
  expect(grid.radio("Monthly")).toBeChecked();
  // The card hides its input, so click the card text.
  await click(grid.text("Yearly"));
  expect(q.text("Billing: yearly")).toBeInTheDocument();
});

test("keeps the state of a nested group apart", async () => {
  const shipping = q.within(q.radiogroup("Shipping"));
  const delivery = q.within(q.radiogroup("Delivery window"));
  expect(shipping.radio("Express")).toBeChecked();
  expect(delivery.radio("Morning")).toBeChecked();
  await click(delivery.radio("Evening"));
  expect(delivery.radio("Evening")).toBeChecked();
  expect(shipping.radio("Express")).toBeChecked();
  await click(shipping.radio("Standard"));
  expect(shipping.radio("Standard")).toBeChecked();
  expect(delivery.radio("Evening")).toBeChecked();
});

test("keeps toolbar items on the toolbar around a group", async () => {
  await focus(q.button("Bold"));
  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
  const group = q.within(q.radiogroup("Alignment"));
  expect(group.radio("Start")).toBeChecked();
  await click(group.radio("Center"));
  await press.ArrowRight();
  expect(group.radio("End")).toHaveFocus();
  expect(group.radio("End")).toBeChecked();
});
