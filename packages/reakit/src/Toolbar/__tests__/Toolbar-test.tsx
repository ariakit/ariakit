import * as React from "react";
import { render } from "react-testing-library";
import Toolbar from "../Toolbar";

test("html attrs", () => {
  const { getByTestId } = render(
    <Toolbar id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Toolbar />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  position: relative;
  display: grid;
  width: 100%;
  padding: 8px;
  grid-gap: 8px;
  grid-template: "start center end" / 1fr auto 1fr;
}

.c0[aria-orientation="vertical"] {
  width: -webkit-min-content;
  width: -moz-min-content;
  width: min-content;
  height: 100%;
  grid-template: "start" 1fr "center" auto "end" 1fr;
}

<div
  aria-orientation="horizontal"
  class="c0 c1"
  role="toolbar"
/>
`);
});

test("styled vertical", () => {
  const { container } = render(<Toolbar vertical />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  position: relative;
  display: grid;
  width: 100%;
  padding: 8px;
  grid-gap: 8px;
  grid-template: "start center end" / 1fr auto 1fr;
}

.c0[aria-orientation="vertical"] {
  width: -webkit-min-content;
  width: -moz-min-content;
  width: min-content;
  height: 100%;
  grid-template: "start" 1fr "center" auto "end" 1fr;
}

<div
  aria-orientation="vertical"
  class="c0 c1"
  role="toolbar"
/>
`);
});

test("styled gutter", () => {
  const { container } = render(<Toolbar gutter={25} />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  position: relative;
  display: grid;
  width: 100%;
  padding: 25px;
  grid-gap: 25px;
  grid-template: "start center end" / 1fr auto 1fr;
}

.c0[aria-orientation="vertical"] {
  width: -webkit-min-content;
  width: -moz-min-content;
  width: min-content;
  height: 100%;
  grid-template: "start" 1fr "center" auto "end" 1fr;
}

<div
  aria-orientation="horizontal"
  class="c0 c1"
  role="toolbar"
/>
`);
});
