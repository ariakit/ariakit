import * as React from "react";
import { click, render } from "reakit-test-utils";
import RadioGroup from "../index";

test("should change the focus", async () => {
  const { getByTestId, getByText } = render(<RadioGroup />);
  const banana = getByText("banana");
  expect(banana).toBeVisible();
  click(banana);
  expect(getByTestId("banana")).toHaveFocus();

  const apple = getByText("apple");
  click(apple);
  expect(getByTestId("apple")).toHaveFocus();
});
