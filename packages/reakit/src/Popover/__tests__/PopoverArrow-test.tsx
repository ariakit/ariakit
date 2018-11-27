import * as React from "react";
import { render } from "react-testing-library";
import PopoverArrow from "../PopoverArrow";

test("html attrs", () => {
  const { getByTestId } = render(
    <PopoverArrow data-testid="test" aria-label="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("fillColor", () => {
  const { container } = render(<PopoverArrow fillColor="red" />);
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
  position: absolute;
  font-size: 30px;
  width: 1em;
  height: 1em;
  pointer-events: none;
  background-color: transparent;
}

.c0 .stroke {
  fill: transparent;
}

.c0 .fill {
  fill: red;
}

[data-placement^="top"] > .c0 {
  top: 100%;
  -webkit-transform: rotateZ(180deg);
  -ms-transform: rotateZ(180deg);
  transform: rotateZ(180deg);
}

[data-placement^="right"] > .c0 {
  right: 100%;
  -webkit-transform: rotateZ(-90deg);
  -ms-transform: rotateZ(-90deg);
  transform: rotateZ(-90deg);
}

[data-placement^="bottom"] > .c0 {
  bottom: 100%;
  -webkit-transform: rotateZ(360deg);
  -ms-transform: rotateZ(360deg);
  transform: rotateZ(360deg);
}

[data-placement^="left"] > .c0 {
  left: 100%;
  -webkit-transform: rotateZ(90deg);
  -ms-transform: rotateZ(90deg);
  transform: rotateZ(90deg);
}

<div
  class="c0 c1"
>
  <svg
    viewBox="0 0 30 30"
  >
    <path
      class="stroke"
      d="M23.7,27.1L17,19.9C16.5,19.3,15.8,19,15,19s-1.6,0.3-2.1,0.9l-6.6,7.2C5.3,28.1,3.4,29,2,29h26 C26.7,29,24.6,28.1,23.7,27.1z"
    />
    <path
      class="fill"
      d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
    />
  </svg>
</div>
`);
});

test("strokeColor", () => {
  const { container } = render(<PopoverArrow strokeColor="red" />);
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
  position: absolute;
  font-size: 30px;
  width: 1em;
  height: 1em;
  pointer-events: none;
  background-color: transparent;
}

.c0 .stroke {
  fill: red;
}

.c0 .fill {
  fill: unset;
}

[data-placement^="top"] > .c0 {
  top: 100%;
  -webkit-transform: rotateZ(180deg);
  -ms-transform: rotateZ(180deg);
  transform: rotateZ(180deg);
}

[data-placement^="right"] > .c0 {
  right: 100%;
  -webkit-transform: rotateZ(-90deg);
  -ms-transform: rotateZ(-90deg);
  transform: rotateZ(-90deg);
}

[data-placement^="bottom"] > .c0 {
  bottom: 100%;
  -webkit-transform: rotateZ(360deg);
  -ms-transform: rotateZ(360deg);
  transform: rotateZ(360deg);
}

[data-placement^="left"] > .c0 {
  left: 100%;
  -webkit-transform: rotateZ(90deg);
  -ms-transform: rotateZ(90deg);
  transform: rotateZ(90deg);
}

<div
  class="c0 c1"
>
  <svg
    viewBox="0 0 30 30"
  >
    <path
      class="stroke"
      d="M23.7,27.1L17,19.9C16.5,19.3,15.8,19,15,19s-1.6,0.3-2.1,0.9l-6.6,7.2C5.3,28.1,3.4,29,2,29h26 C26.7,29,24.6,28.1,23.7,27.1z"
    />
    <path
      class="fill"
      d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
    />
  </svg>
</div>
`);
});

test("styled", () => {
  const { container } = render(<PopoverArrow />);
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
  position: absolute;
  font-size: 30px;
  width: 1em;
  height: 1em;
  pointer-events: none;
  background-color: transparent;
}

.c0 .stroke {
  fill: transparent;
}

.c0 .fill {
  fill: unset;
}

[data-placement^="top"] > .c0 {
  top: 100%;
  -webkit-transform: rotateZ(180deg);
  -ms-transform: rotateZ(180deg);
  transform: rotateZ(180deg);
}

[data-placement^="right"] > .c0 {
  right: 100%;
  -webkit-transform: rotateZ(-90deg);
  -ms-transform: rotateZ(-90deg);
  transform: rotateZ(-90deg);
}

[data-placement^="bottom"] > .c0 {
  bottom: 100%;
  -webkit-transform: rotateZ(360deg);
  -ms-transform: rotateZ(360deg);
  transform: rotateZ(360deg);
}

[data-placement^="left"] > .c0 {
  left: 100%;
  -webkit-transform: rotateZ(90deg);
  -ms-transform: rotateZ(90deg);
  transform: rotateZ(90deg);
}

<div
  class="c0 c1"
>
  <svg
    viewBox="0 0 30 30"
  >
    <path
      class="stroke"
      d="M23.7,27.1L17,19.9C16.5,19.3,15.8,19,15,19s-1.6,0.3-2.1,0.9l-6.6,7.2C5.3,28.1,3.4,29,2,29h26 C26.7,29,24.6,28.1,23.7,27.1z"
    />
    <path
      class="fill"
      d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
    />
  </svg>
</div>
`);
});
