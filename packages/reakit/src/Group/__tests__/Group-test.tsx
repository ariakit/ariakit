import * as React from "react";
import { render } from "react-testing-library";
import Group from "../Group";

test("html attrs", () => {
  const { getByTestId } = render(
    <Group id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Group />);
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
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}

.c0 > *:not(:first-child):not(:last-child),
.c0 > *:not(:first-child):not(:last-child) .sc-bwzfXH {
  border-radius: 0;
  border-left-width: 0;
}

.c0 > *:first-child,
.c0 > *:first-child .sc-bwzfXH {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.c0 > *:last-child,
.c0 > *:last-child .sc-bwzfXH {
  border-top-left-radius: 0;
  border-left-width: 0;
  border-bottom-left-radius: 0;
}

<div
  class="c0 c1"
  role="group"
/>
`);
});

test("styled vertical", () => {
  const { container } = render(<Group vertical />);
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
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}

.c0 > *:not(:first-child):not(:last-child),
.c0 > *:not(:first-child):not(:last-child) .sc-bwzfXH {
  border-radius: 0;
  border-top-width: 0;
}

.c0 > *:first-child,
.c0 > *:first-child .sc-bwzfXH {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.c0 > *:last-child,
.c0 > *:last-child .sc-bwzfXH {
  border-top-left-radius: 0;
  border-top-width: 0;
  border-top-right-radius: 0;
}

<div
  class="c0 c1"
  role="group"
/>
`);
});

test("styled vertical at", () => {
  const { container } = render(<Group verticalAt={500} />);
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
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}

.c0 > *:not(:first-child):not(:last-child),
.c0 > *:not(:first-child):not(:last-child) .sc-bwzfXH {
  border-radius: 0;
}

.c0 > *:first-child,
.c0 > *:first-child .sc-bwzfXH {
  border-bottom-right-radius: 0;
}

.c0 > *:last-child,
.c0 > *:last-child .sc-bwzfXH {
  border-top-left-radius: 0;
}

@media (max-width:500px) {
  .c0 {
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
  }
}

@media (min-width:501px) {
  .c0 > *:not(:first-child):not(:last-child),
  .c0 > *:not(:first-child):not(:last-child) .sc-bwzfXH {
    border-left-width: 0;
  }
}

@media (max-width:500px) {
  .c0 > *:not(:first-child):not(:last-child),
  .c0 > *:not(:first-child):not(:last-child) .sc-bwzfXH {
    border-top-width: 0;
  }
}

@media (min-width:501px) {
  .c0 > *:first-child,
  .c0 > *:first-child .sc-bwzfXH {
    border-top-right-radius: 0;
  }
}

@media (max-width:500px) {
  .c0 > *:first-child,
  .c0 > *:first-child .sc-bwzfXH {
    border-bottom-left-radius: 0;
  }
}

@media (min-width:501px) {
  .c0 > *:last-child,
  .c0 > *:last-child .sc-bwzfXH {
    border-left-width: 0;
    border-bottom-left-radius: 0;
  }
}

@media (max-width:500px) {
  .c0 > *:last-child,
  .c0 > *:last-child .sc-bwzfXH {
    border-top-width: 0;
    border-top-right-radius: 0;
  }
}

<div
  class="c0 c1"
  role="group"
/>
`);
});
