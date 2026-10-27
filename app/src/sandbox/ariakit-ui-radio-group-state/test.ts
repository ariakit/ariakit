import { click, focus, press, q } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement } from "react";
import { expect, test, vi } from "vitest";
import {
  ProviderGroupWithDefaultValue,
  StoreGroupWithValue,
} from "./index.react.tsx";

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

test("shares the state of an outer provider", async () => {
  const group = q.within(q.radiogroup("Contact method"));
  expect(group.radio("Email")).toBeChecked();
  expect(q.text("Contact by: email")).toBeInTheDocument();
  await click(group.radio("Phone"));
  expect(q.text("Contact by: phone")).toBeInTheDocument();
});

test("labels a card grid that a store prop owns", async () => {
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

test("ignores and warns about state props when a provider owns the state", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await render(createElement(ProviderGroupWithDefaultValue));
    const group = q.within(q.radiogroup("Reply method"));
    expect(group.radio("Email")).toBeChecked();
    expect(group.radio("Phone")).not.toBeChecked();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("ignores defaultValue"),
    );
  } finally {
    warn.mockRestore();
  }
});

test("ignores and warns about state props when a store prop owns the state", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await render(createElement(StoreGroupWithValue));
    const group = q.within(q.radiogroup("Follow-up method"));
    expect(group.radio("Email")).toBeChecked();
    await click(group.radio("Phone"));
    await click(group.radio("Email"));
    expect(group.radio("Email")).toBeChecked();
    // setValue is not called, so the app state keeps its initial value.
    expect(q.text("Follow-up state: phone")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("ignores value, setValue"),
    );
  } finally {
    warn.mockRestore();
  }
});
