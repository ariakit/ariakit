import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import HiddenHide from "../HiddenHide";

it("calls hide and onClick on click", () => {
  const hide = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <HiddenHide hide={hide} onClick={onClick}>
      test
    </HiddenHide>
  );
  expect(hide).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(hide).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});
