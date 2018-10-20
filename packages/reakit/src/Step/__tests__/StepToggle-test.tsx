import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import StepToggle from "../StepToggle";

test("html attrs", () => {
  const { getByText } = render(
    <StepToggle step="test" id="test" aria-label="test" toggle={jest.fn()}>
      test
    </StepToggle>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("call toggle and onClick on click", () => {
  const toggle = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <StepToggle step="test" toggle={toggle} onClick={onClick}>
      test
    </StepToggle>
  );
  expect(toggle).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("styled", () => {
  const { container } = render(<StepToggle step="test" toggle={jest.fn()} />);
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
  step="test"
/>
`);
});
