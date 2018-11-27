import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import PopoverHide from "../PopoverHide";

beforeEach(() => {
  jest.clearAllMocks();
});

test("html attrs", () => {
  const { getByTestId } = render(
    <PopoverHide data-testid="test" aria-label="test" hide={jest.fn()} />
  );
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("popoverId", () => {
  const { container } = render(
    <PopoverHide popoverId="custom-id" data-testid="test" hide={jest.fn()} />
  );
  expect(container.firstChild).toHaveAttribute("aria-controls", "custom-id");
});

test("visible", () => {
  const { container } = render(
    <PopoverHide visible data-testid="test" hide={jest.fn()} />
  );
  expect(container.firstChild).toHaveAttribute("aria-expanded", "true");
});

test("hide", () => {
  const hide = jest.fn();
  const { getByTestId } = render(
    <PopoverHide data-testid="test" aria-label="test" hide={hide} />
  );
  fireEvent.click(getByTestId("test"));
  expect(hide).toHaveBeenCalledTimes(1);
});
