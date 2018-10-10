import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import HiddenShow from "../HiddenShow";

test("html attrs", () => {
  const { getByText } = render(
    <HiddenShow id="test" aria-label="test" show={jest.fn()}>
      test
    </HiddenShow>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("call show and onClick on click", () => {
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
