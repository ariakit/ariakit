import * as React from "react";
import { render } from "react-testing-library";
import Grid from "../Grid";

test("html attrs", () => {
  const { getByTestId } = render(
    <Grid id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Grid />);
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
  display: grid;
}

<div
  class="c0 c1"
/>
`);
});

test("styled row", () => {
  const { container } = render(<Grid row />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-auto-flow: row;
}

<div
  class="c0 c1"
/>
`);
});

test("styled column", () => {
  const { container } = render(<Grid column />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-auto-flow: column;
}

<div
  class="c0 c1"
/>
`);
});

test("styled dense", () => {
  const { container } = render(<Grid dense />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-auto-flow: dense;
}

<div
  class="c0 c1"
/>
`);
});

test("styled gap", () => {
  const { container } = render(<Grid gap="20px" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-gap: 20px;
}

<div
  class="c0 c1"
/>
`);
});

test("styled template", () => {
  const { container } = render(<Grid template="100px 1fr / 50px 1fr" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-template: 100px 1fr / 50px 1fr;
}

<div
  class="c0 c1"
/>
`);
});

test("styled areas", () => {
  const { container } = render(<Grid areas="a b b" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-template-areas: a b b;
}

<div
  class="c0 c1"
/>
`);
});

test("styled columns", () => {
  const { container } = render(<Grid columns="100px 1fr" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-template-columns: 100px 1fr;
}

<div
  class="c0 c1"
/>
`);
});

test("styled auto columns", () => {
  const { container } = render(<Grid autoColumns="100px" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-auto-columns: 100px;
}

<div
  class="c0 c1"
/>
`);
});

test("styled auto rows", () => {
  const { container } = render(<Grid autoRows="100px" />);
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
  display: grid;
}

.c0.c0.c0 {
  grid-auto-rows: 100px;
}

<div
  class="c0 c1"
/>
`);
});
