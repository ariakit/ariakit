import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import OverlayHide from "../OverlayHide";

test("html attrs", () => {
  const { getByText } = render(
    <OverlayHide id="test" aria-label="test" hide={jest.fn()}>
      test
    </OverlayHide>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("call hide and onClick on click", () => {
  const hide = jest.fn();
  const onClick = jest.fn();
  const { getByText } = render(
    <OverlayHide hide={hide} onClick={onClick}>
      test
    </OverlayHide>
  );
  expect(hide).toHaveBeenCalledTimes(0);
  expect(onClick).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(hide).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("styled", () => {
  const { container } = render(<OverlayHide hide={jest.fn()} />);
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
