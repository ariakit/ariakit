import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { Tabbable } from "../Tabbable";

test("render", () => {
  const { getByText } = render(<Tabbable>button</Tabbable>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  tabindex="0"
>
  button
</button>
`);
});

test("render disabled", () => {
  const { getByText } = render(<Tabbable disabled>button</Tabbable>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  disabled=""
>
  button
</button>
`);
});

test("render disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      button
    </Tabbable>
  );
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  tabindex="0"
>
  button
</button>
`);
});

test("click", () => {
  const fn = jest.fn();
  const { getByText } = render(<Tabbable onClick={fn}>button</Tabbable>);
  const button = getByText("button");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled>
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled focusable>
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus", () => {
  const { getByText } = render(<Tabbable>button</Tabbable>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("focus disabled", () => {
  const { getByText } = render(<Tabbable disabled>button</Tabbable>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).not.toHaveFocus();
});

test("focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      button
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button click", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      button
    </Tabbable>
  );
  const button = getByText("button");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native button click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled>
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled focusable>
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.click(button);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button focus", () => {
  const { getByText } = render(<Tabbable as="div">button</Tabbable>);
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button focus disabled", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled>
      button
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).not.toHaveFocus();
});

test("non-native button focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled focusable>
      button
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
});

test("non-native button space/enter", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} clickKeys={["Enter", " "]}>
      button
    </Tabbable>
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
    <Tabbable as="div" disabled onClick={fn} clickKeys={["Enter", " "]}>
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.keyDown(button, { key: "Enter" });
  fireEvent.keyDown(button, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button space/enter disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable
      as="div"
      disabled
      focusable
      onClick={fn}
      clickKeys={["Enter", " "]}
    >
      button
    </Tabbable>
  );
  const button = getByText("button");
  fireEvent.keyDown(button, { key: "Enter" });
  fireEvent.keyDown(button, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});
