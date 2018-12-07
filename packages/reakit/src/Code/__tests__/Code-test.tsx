import * as React from "react";
import { render } from "react-testing-library";
import Code from "../Code";

test("html attrs", () => {
  const { getByTestId } = render(
    <Code id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Code />);
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

<code
  class="c0"
/>
`);
});

test("styled block", () => {
  const { container } = render(<Code block />);
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

<pre
  class="c0"
>
  <code />
</pre>
`);
});

test("styled with custom CSS class", () => {
  const cssClassName = "chuck-norris";
  const { getByTestId } = render(
    <Code codeClassName={cssClassName} data-testid="test" />
  );

  expect(getByTestId("test").className).toContain(cssClassName);
});
