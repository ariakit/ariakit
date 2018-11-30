import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import PopoverShow from "../PopoverShow";

beforeEach(() => {
  jest.clearAllMocks();
});

test("html attrs", () => {
  const { getByTestId } = render(
    <PopoverShow data-testid="test" aria-label="test" show={jest.fn()} />
  );
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("popoverId", () => {
  const { container } = render(
    <PopoverShow popoverId="custom-id" data-testid="test" show={jest.fn()} />
  );
  expect(container.firstChild).toHaveAttribute("aria-controls", "custom-id");
});

test("visible", () => {
  const { container } = render(
    <PopoverShow visible data-testid="test" show={jest.fn()} />
  );
  expect(container.firstChild).toHaveAttribute("aria-expanded", "true");
});

test("show", () => {
  const show = jest.fn();
  const { getByTestId } = render(
    <PopoverShow data-testid="test" aria-label="test" show={show} />
  );
  fireEvent.click(getByTestId("test"));
  expect(show).toHaveBeenCalledTimes(1);
});
