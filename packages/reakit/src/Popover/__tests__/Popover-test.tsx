import * as React from "react";
import { render } from "react-testing-library";
import Popover from "../Popover";

test("html attrs", () => {
  const { getByText } = render(
    <Popover id="test" aria-label="test">
      Test
    </Popover>
  );
  expect(getByText("Test")).toHaveAttribute("id", "test");
  expect(getByText("Test")).toHaveAttribute("aria-label", "test");
});

test("placement", () => {
  const { container } = render(<Popover placement="right" />);
  expect(container.firstChild).toHaveAttribute("data-placement", "right");
});

test("popoverId", () => {
  const customId = "custom-id";
  const { container } = render(<Popover popoverId={customId} />);
  expect(container.firstChild).toHaveAttribute("id", customId);
});

test("styled", () => {
  const { container } = render(<Popover />);
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
  position: absolute;
  top: 0;
  left: 0;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
  cursor: auto;
  z-index: 999;
}

<div
  aria-hidden="true"
  class="c0 c1 c2"
  data-placement="bottom"
  hidden=""
  role="group"
/>
`);
});

test("styled visible", () => {
  const { container } = render(<Popover visible />);
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
  position: absolute;
  top: 0;
  left: 0;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
  cursor: auto;
  z-index: 999;
}

<div
  aria-hidden="false"
  class="c0 c1 c2"
  data-placement="bottom"
  role="group"
/>
`);
});
