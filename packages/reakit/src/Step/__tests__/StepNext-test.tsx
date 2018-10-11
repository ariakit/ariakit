import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import StepNext from "../StepNext";

test("html attrs", () => {
  const { getByText } = render(
    <StepNext id="test" aria-label="test" next={jest.fn()}>
      test
    </StepNext>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("call next and onClick on click", () => {
  const next = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <StepNext next={next} onClick={onClick}>
      test
    </StepNext>
  );
  expect(next).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(next).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("styled", () => {
  const { container } = render(<StepNext next={jest.fn()} />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c0 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: unset;
  color: inherit;
}

<button
  class="c0"
/>
`);
});
