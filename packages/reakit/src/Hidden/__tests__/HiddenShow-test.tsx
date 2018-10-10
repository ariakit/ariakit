import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import HiddenShow from "../HiddenShow";

it("calls show and onClick on click", () => {
  const show = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <HiddenShow show={show} onClick={onClick}>
      test
    </HiddenShow>
  );
  expect(show).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(show).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});
