import * as React from "react";
import { render } from "react-testing-library";
import GridItem from "../GridItem";

test("html attrs", () => {
  const { getByTestId } = render(
    <GridItem id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<GridItem />);
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

<div
  class="c0"
/>
`);
});

test("styled area", () => {
  const { container } = render(<GridItem area="some-grid-area" />);
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

.c0.c0.c0 {
  grid-area: some-grid-area;
}

<div
  class="c0 c1"
/>
`);
});

test("styled column", () => {
  const { container } = render(<GridItem column="1 /3" />);
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

.c0.c0.c0 {
  grid-column: 1 /3;
}

<div
  class="c0 c1"
/>
`);
});

test("styled row", () => {
  const { container } = render(<GridItem row="span 3" />);
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

.c0.c0.c0 {
  grid-row: span 3;
}

<div
  class="c0 c1"
/>
`);
});

test("styled columnStart", () => {
  const { container } = render(<GridItem columnStart="2" />);
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

.c0.c0.c0 {
  grid-column-start: 2;
}

<div
  class="c0 c1"
/>
`);
});

test("styled columnEnd", () => {
  const { container } = render(<GridItem columnEnd="2" />);
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

.c0.c0.c0 {
  grid-column-end: 2;
}

<div
  class="c0 c1"
/>
`);
});

test("styled rowStart", () => {
  const { container } = render(<GridItem rowStart="span 3" />);
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

.c0.c0.c0 {
  grid-row-start: span 3;
}

<div
  class="c0 c1"
/>
`);
});

test("styled rowEnd", () => {
  const { container } = render(<GridItem rowEnd="span 3" />);
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

.c0.c0.c0 {
  grid-row-end: span 3;
}

<div
  class="c0 c1"
/>
`);
});
