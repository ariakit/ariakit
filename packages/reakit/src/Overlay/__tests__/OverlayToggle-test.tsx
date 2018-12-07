import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import OverlayToggle from "../OverlayToggle";

test("html attrs", () => {
  const { getByText } = render(
    <OverlayToggle id="test" aria-label="test" toggle={jest.fn()}>
      test
    </OverlayToggle>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("call toggle and onClick on click", () => {
  const toggle = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <OverlayToggle toggle={toggle} onClick={onClick}>
      test
    </OverlayToggle>
  );
  expect(toggle).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("styled", () => {
  const { container } = render(<OverlayToggle toggle={jest.fn()} />);
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

.c0:focus:not(:focus-visible) {
  outline: none;
}

<button
  class="c0"
/>
`);
});
