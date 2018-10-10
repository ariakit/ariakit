import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import HiddenToggle from "../HiddenToggle";

it("calls toggle and onClick on click", () => {
  const toggle = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <HiddenToggle toggle={toggle} onClick={onClick}>
      test
    </HiddenToggle>
  );
  expect(toggle).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});
