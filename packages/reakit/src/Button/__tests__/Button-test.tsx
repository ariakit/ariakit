import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  role="button"
  tabindex="0"
>
  button
</button>
`);
});

test("render disabled", () => {
  const { getByText } = render(<Button disabled>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  disabled=""
  role="button"
>
  button
</button>
`);
});

test("render disabled focusable", () => {
  const { getByText } = render(
    <Button disabled focusable>
      button
    </Button>
  );
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  role="button"
  tabindex="0"
>
  button
</button>
`);
});

test("click", () => {
  const fn = jest.fn();
  const { getByText } = render(<Button onClick={fn}>button</Button>);
  const button = getByText("button");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button onClick={fn} disabled>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button onClick={fn} disabled focusable>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus", () => {
  const { getByText } = render(<Button>button</Button>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("focus disabled", () => {
  const { getByText } = render(<Button disabled>button</Button>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).not.toHaveFocus();
});

test("focus disabled focusable", () => {
  const { getByText } = render(
    <Button disabled focusable>
      button
    </Button>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button click", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" onClick={fn}>
      button
    </Button>
  );
  const button = getByText("button");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native button click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" onClick={fn} disabled>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" onClick={fn} disabled focusable>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button focus", () => {
  const { getByText } = render(<Button as="div">button</Button>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button focus disabled", () => {
  const { getByText } = render(
    <Button as="div" disabled>
      button
    </Button>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).not.toHaveFocus();
});

test("non-native button focus disabled focusable", () => {
  const { getByText } = render(
    <Button as="div" disabled focusable>
      button
    </Button>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button space/enter", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" onClick={fn}>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.keyDown(button, { key: "Enter" });
  expect(fn).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(button, { key: " " });
  expect(fn).toHaveBeenCalledTimes(2);
});

test("non-native button space/enter disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" disabled onClick={fn}>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.keyDown(button, { key: "Enter" });
  fireEvent.keyDown(button, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button space/enter disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" disabled focusable onClick={fn}>
      button
    </Button>
  );
  const button = getByText("button");
  fireEvent.keyDown(button, { key: "Enter" });
  fireEvent.keyDown(button, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});
