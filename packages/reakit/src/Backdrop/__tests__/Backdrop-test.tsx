import * as React from "react";
import { render } from "react-testing-library";
import Backdrop from "../Backdrop";

test("unmount", () => {
  const { container, rerender } = render(<Backdrop unmount />);
  expect(container.firstChild).toBeNull();
  rerender(<Backdrop unmount visible />);
  expect(container.firstChild).not.toBeNull();
});

test("html attrs", () => {
  const { getByTestId } = render(
    <Backdrop id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Backdrop />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c2 {
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

.c2:focus:not(:focus-visible) {
  outline: none;
}

.c1 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c1[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

.c0 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -moz-tap-highlight-color: rgba(0,0,0,0);
}

<div
  aria-hidden="true"
  class="c0 c1 c2"
  hidden=""
  role="button"
  tabindex="-1"
/>
`);
});

test("styled visible", () => {
  const { container } = render(<Backdrop visible />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c2 {
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

.c2:focus:not(:focus-visible) {
  outline: none;
}

.c1 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c1[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

.c0 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -moz-tap-highlight-color: rgba(0,0,0,0);
}

<div
  aria-hidden="false"
  class="c0 c1 c2"
  role="button"
  tabindex="-1"
/>
`);
});
