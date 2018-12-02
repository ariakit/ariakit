import * as React from "react";
import { render } from "react-testing-library";
import Overlay from "../Overlay";

test("unmount", () => {
  const { container, rerender } = render(<Overlay unmount />);
  expect(container.firstChild).toBeNull();
  rerender(<Overlay unmount visible />);
  expect(container.firstChild).not.toBeNull();
});

test("html attrs", () => {
  const { getByTestId } = render(
    <Overlay id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Overlay />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
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

.c0 {
  -webkit-transform: translate3d(-50%,-50%,0px);
  -ms-transform: translate3d(-50%,-50%,0px);
  transform: translate3d(-50%,-50%,0px);
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
}

.c0[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

<div
  aria-hidden="true"
  aria-modal="true"
  class="c0 c1"
  hidden=""
  role="dialog"
/>
`);
});

test("styled visible", () => {
  const { container } = render(<Overlay visible />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
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

.c0 {
  -webkit-transform: translate3d(-50%,-50%,0px);
  -ms-transform: translate3d(-50%,-50%,0px);
  transform: translate3d(-50%,-50%,0px);
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
}

.c0[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

<div
  aria-hidden="false"
  aria-modal="true"
  class="c0 c1"
  role="dialog"
/>
`);
});
