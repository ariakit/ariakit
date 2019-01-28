import * as React from "react";
import { render } from "react-testing-library";
import Box from "../Box";

test("html attrs", () => {
  const { getByTestId } = render(
    <Box id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Box />);
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

test("styled palette", () => {
  const { container } = render(<Box palette="primary" />);
  expect(container.firstChild).toMatchSnapshot(`
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
  color: rgb(33, 150, 243);
}

.c0:focus:not(:focus-visible) {
  outline: none;
}

<div
  class="c0"
/>
`);
});

test("styled opaque", () => {
  const { container } = render(<Box palette="primary" opaque />);
  expect(container.firstChild).toMatchSnapshot(`
.c0 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: rgb(33, 150, 243);;
  color: white;
}

.c0:focus:not(:focus-visible) {
  outline: none;
}

<div
  class="c0"
/>
`);
});

test("styled tone", () => {
  const { container } = render(<Box palette="primary" tone={1} opaque />);
  expect(container.firstChild).toMatchSnapshot(`
.c0 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: rgb(66, 165, 245);
  color: white;
}

.c0:focus:not(:focus-visible) {
  outline: none;
}

<div
  class="c0"
/>
`);
});
