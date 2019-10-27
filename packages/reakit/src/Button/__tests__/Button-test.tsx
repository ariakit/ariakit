import * as React from "react";
import { render } from "@testing-library/react";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
    <button
      type="button"
    >
      button
    </button>
  `);
});

test("render anchor", () => {
  const { getByText } = render(<Button as="a">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
    <a
      type="button"
    >
      button
    </a>
  `);
});

test("render div", () => {
  const { getByText } = render(<Button as="div">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
    <div
      role="button"
      tabindex="0"
      type="button"
    >
      button
    </div>
  `);
});
