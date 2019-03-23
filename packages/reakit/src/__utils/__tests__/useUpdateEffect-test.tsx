import * as React from "react";
import { render } from "react-testing-library";
import { useUpdateEffect } from "../useUpdateEffect";

test("useUpdateEffect", () => {
  const fn = jest.fn();
  const Test = () => {
    useUpdateEffect(fn);
    return null;
  };
  const { rerender } = render(<Test />);
  expect(fn).not.toHaveBeenCalled();
  rerender(<Test />);
  expect(fn).toHaveBeenCalled();
});
