import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import Toolbar from "../Toolbar";
import ToolbarFocusable from "../ToolbarFocusable";

test("html attrs", () => {
  const { getByTestId } = render(
    <Toolbar>
      <ToolbarFocusable id="test" aria-label="test" data-testid="test" />
    </Toolbar>
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("add event handler on disabled update", () => {
  const { getByTestId, rerender } = render(
    <Toolbar>
      <ToolbarFocusable data-testid="test" disabled />
    </Toolbar>
  );
  const addEventListener = jest.spyOn(getByTestId("test"), "addEventListener");
  rerender(
    <Toolbar id="toolbar">
      <ToolbarFocusable />
    </Toolbar>
  );
  expect(addEventListener).toHaveBeenCalledTimes(1);
});

test("remove event handler on disabled update", () => {
  const { getByTestId, rerender } = render(
    <Toolbar>
      <ToolbarFocusable data-testid="test" />
    </Toolbar>
  );
  const removeEventListener = jest.spyOn(
    getByTestId("test"),
    "removeEventListener"
  );
  rerender(
    <Toolbar id="toolbar">
      <ToolbarFocusable disabled />
    </Toolbar>
  );
  expect(removeEventListener).toHaveBeenCalledTimes(1);
});

test("onFocus", () => {
  const onFocus = jest.fn();
  const { getByTestId } = render(
    <Toolbar>
      <ToolbarFocusable />
      <ToolbarFocusable data-testid="test" onFocus={onFocus} />
    </Toolbar>
  );
  fireEvent.focus(getByTestId("test"));
  expect(onFocus).toHaveBeenCalledTimes(1);
  expect(getByTestId("test")).toHaveAttribute("tabindex", "0");
});

test("styled", () => {
  const { getByTestId } = render(
    <Toolbar>
      <ToolbarFocusable />
      <ToolbarFocusable data-testid="test" />
    </Toolbar>
  );
  expect(getByTestId("test")).toMatchInlineSnapshot(`
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

<div
  class="c0"
  data-testid="test"
  tabindex="-1"
/>
`);
});

test("styled tabIndex", () => {
  const { getByTestId } = render(
    <Toolbar>
      <ToolbarFocusable />
      <ToolbarFocusable tabIndex={0} data-testid="test" />
    </Toolbar>
  );
  expect(getByTestId("test")).toMatchInlineSnapshot(`
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

<div
  class="c0"
  data-testid="test"
  tabindex="0"
/>
`);
});
