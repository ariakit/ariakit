import * as React from "react";
import { render } from "react-testing-library";
import Sidebar from "../Sidebar";

test("html attrs", () => {
  const { getByTestId } = render(
    <Sidebar id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Sidebar />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c3 {
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

.c2 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c2[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

.c1 {
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
}

.c0 {
  top: 0;
  height: 100vh;
  -webkit-transform: none;
  -ms-transform: none;
  transform: none;
  overflow: auto;
  left: 0;
  right: auto;
}

<div
  aria-hidden="true"
  aria-modal="true"
  class="c0 c1 c2 c3"
  hidden=""
  role="dialog"
/>
`);
});

test("styled visible", () => {
  const { container } = render(<Sidebar visible />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c3 {
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

.c2 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c2[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

.c1 {
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
}

.c0 {
  top: 0;
  height: 100vh;
  -webkit-transform: none;
  -ms-transform: none;
  transform: none;
  overflow: auto;
  left: 0;
  right: auto;
}

<div
  aria-hidden="false"
  aria-modal="true"
  class="c0 c1 c2 c3"
  role="dialog"
/>
`);
});

test("align right", () => {
  const { container } = render(<Sidebar visible align="right" />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c3 {
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

.c2 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c2[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

.c1 {
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
}

.c0 {
  top: 0;
  height: 100vh;
  -webkit-transform: none;
  -ms-transform: none;
  transform: none;
  overflow: auto;
  left: auto;
  right: 0;
}

<div
  aria-hidden="false"
  aria-modal="true"
  class="c0 c1 c2 c3"
  role="dialog"
/>
`);
});
