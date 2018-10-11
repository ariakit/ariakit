import * as React from "react";
import { render } from "react-testing-library";
import Step, { StepProps } from "../Step";

const props: StepProps = {
  step: "foo",
  order: 0,
  register: jest.fn(),
  update: jest.fn(),
  unregister: jest.fn(),
  isCurrent: jest.fn().mockReturnValue(true)
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("register on mount", () => {
  render(<Step {...props} />);
  expect(props.register).toHaveBeenCalledWith("foo", 0);
});

test("call update when step has changed", () => {
  const { rerender } = render(<Step {...props} />);
  rerender(<Step {...props} step="bar" />);
  expect(props.update).toHaveBeenCalledWith("foo", "bar", 0);
});

test("call update when order has changed", () => {
  const { rerender } = render(<Step {...props} />);
  rerender(<Step {...props} order={1} />);
  expect(props.update).toHaveBeenCalledWith("foo", "foo", 1);
});

test("do not call update when other prop has changed", () => {
  const { rerender } = render(<Step {...props} />);
  rerender(<Step {...props} id="foo" />);
  expect(props.update).not.toHaveBeenCalled();
});

test("call unregister on unmount", () => {
  const { unmount } = render(<Step {...props} />);
  unmount();
  expect(props.unregister).toHaveBeenCalledWith("foo");
});

test("visible when it is current", () => {
  const { getByText } = render(
    <Step {...props} isCurrent={() => true}>
      test
    </Step>
  );
  expect(getByText("test")).toHaveAttribute("aria-hidden", "false");
});

test("unmounted when it is not current", () => {
  const { container } = render(
    <Step {...props} isCurrent={() => false}>
      test
    </Step>
  );
  expect(container.firstChild).toBeNull();
});
