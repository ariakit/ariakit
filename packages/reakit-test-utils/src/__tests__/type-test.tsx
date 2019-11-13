import * as React from "react";
import { render } from "../react-testing-library";
import { type } from "../type";
import { press } from "../press";

test("type", () => {
  const onChange = jest.fn(event => event.target.value);
  const { getByLabelText } = render(
    <input aria-label="input" onChange={onChange} />
  );
  const input = getByLabelText("input");
  // type(input, "{esc} ab c def");
  type(input, "ab c def");
  expect(onChange).toHaveReturnedWith("a");
  expect(onChange).toHaveReturnedWith("ab");
  expect(onChange).toHaveReturnedWith("ab ");
  expect(onChange).toHaveReturnedWith("ab c");
  expect(onChange).toHaveReturnedWith("ab c d");
  expect(onChange).toHaveReturnedWith("ab c de");
  expect(onChange).toHaveReturnedWith("ab c def");
});
