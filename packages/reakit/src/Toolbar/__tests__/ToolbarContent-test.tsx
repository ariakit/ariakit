import * as React from "react";
import { render } from "react-testing-library";
import ToolbarContent from "../ToolbarContent";

test("html attrs", () => {
  const { getByTestId } = render(
    <ToolbarContent id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<ToolbarContent />);
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
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: inherit;
  grid-area: start;
  -webkit-box-pack: start;
  -webkit-justify-content: start;
  -ms-flex-pack: start;
  justify-content: start;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

[aria-orientation="vertical"] > .c0 {
  grid-auto-flow: row;
  grid-auto-rows: min-content;
  -webkit-box-pack: initial;
  -webkit-justify-content: initial;
  -ms-flex-pack: initial;
  justify-content: initial;
  -webkit-align-content: start;
  -ms-flex-line-pack: start;
  align-content: start;
}

<div
  class="c0 c1"
/>
`);
});

test("styled align center", () => {
  const { container } = render(<ToolbarContent align="center" />);
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
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: inherit;
  grid-area: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

[aria-orientation="vertical"] > .c0 {
  grid-auto-flow: row;
  grid-auto-rows: min-content;
  -webkit-box-pack: initial;
  -webkit-justify-content: initial;
  -ms-flex-pack: initial;
  justify-content: initial;
  -webkit-align-content: center;
  -ms-flex-line-pack: center;
  align-content: center;
}

<div
  class="c0 c1"
/>
`);
});

test("styled align end", () => {
  const { container } = render(<ToolbarContent align="end" />);
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
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: inherit;
  grid-area: end;
  -webkit-box-pack: end;
  -webkit-justify-content: end;
  -ms-flex-pack: end;
  justify-content: end;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

[aria-orientation="vertical"] > .c0 {
  grid-auto-flow: row;
  grid-auto-rows: min-content;
  -webkit-box-pack: initial;
  -webkit-justify-content: initial;
  -ms-flex-pack: initial;
  justify-content: initial;
  -webkit-align-content: end;
  -ms-flex-line-pack: end;
  align-content: end;
}

<div
  class="c0 c1"
/>
`);
});
