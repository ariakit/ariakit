import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import PopoverToggle from "../PopoverToggle";

beforeEach(() => {
  jest.clearAllMocks();
});

test("html attrs", () => {
  const { getByTestId } = render(
    <PopoverToggle data-testid="test" aria-label="test" toggle={jest.fn()} />
  );
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("popoverId", () => {
  const { container } = render(
    <PopoverToggle
      popoverId="custom-id"
      data-testid="test"
      toggle={jest.fn()}
    />
  );
  expect(container.firstChild).toHaveAttribute("aria-controls", "custom-id");
});

test("visible", () => {
  const { container } = render(
    <PopoverToggle visible data-testid="test" toggle={jest.fn()} />
  );
  expect(container.firstChild).toHaveAttribute("aria-expanded", "true");
});

test("toggle", () => {
  const toggle = jest.fn();
  const { getByTestId } = render(
    <PopoverToggle data-testid="test" aria-label="test" toggle={toggle} />
  );
  fireEvent.click(getByTestId("test"));
  expect(toggle).toHaveBeenCalledTimes(1);
});
