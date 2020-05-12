import * as React from "react";
import { render, press } from "reakit-test-utils";
import VirtualNestedCompositeItems from "..";

test("navigate through nested composite items", () => {
  const { getByText: text, getByLabelText: label } = render(
    <VirtualNestedCompositeItems />
  );
  press.Tab();
  expect(label("item0")).toHaveFocus();
  press.ArrowDown();
  expect(text("item1")).toHaveFocus();
  press.ArrowRight();
  expect(text("item2")).toHaveFocus();
  press.ArrowRight();
  expect(text("item3")).toHaveFocus();
  press.ArrowRight();
  expect(label("item0")).toHaveFocus();
  press.ArrowLeft();
  expect(text("item3")).toHaveFocus();
  press.ArrowUp();
  expect(text("item2")).toHaveFocus();
  press.Home();
  expect(label("item0")).toHaveFocus();
});
