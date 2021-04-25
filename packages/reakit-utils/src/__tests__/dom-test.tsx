import * as React from "react";
import { render, screen } from "reakit-test-utils";
import {
  closest,
  contains,
  isButton,
  isTextField,
  getNativeElementType,
} from "../dom";

test("closest", () => {
  render(
    <div className="parent" data-testid="parent">
      <div data-testid="child" />
    </div>
  );
  const parent = screen.getByTestId("parent");
  const child = screen.getByTestId("child");
  expect(closest(child, "div")).toEqual(child);
  expect(closest(child, ".parent")).toEqual(parent);
});

test("contains", () => {
  render(
    <div className="parent" data-testid="parent">
      <div data-testid="child" />
    </div>
  );
  const parent = screen.getByTestId("parent");
  const child = screen.getByTestId("child");
  expect(contains(child, child)).toBe(true);
  expect(contains(child, parent)).toBe(false);
  expect(contains(parent, child)).toBe(true);
});

test("isButton", () => {
  render(
    <>
      <button aria-label="item1" />
      <button type="submit" aria-label="item2" />
      <input type="submit" aria-label="item3" />
      <input type="text" aria-label="item4" />
      <div role="button" aria-label="item5" />
    </>
  );
  expect(isButton(screen.getByLabelText("item1"))).toBe(true);
  expect(isButton(screen.getByLabelText("item2"))).toBe(true);
  expect(isButton(screen.getByLabelText("item3"))).toBe(true);
  expect(isButton(screen.getByLabelText("item4"))).toBe(false);
  expect(isButton(screen.getByLabelText("item5"))).toBe(false);
});

test("isTextField", () => {
  render(
    <>
      <div aria-label="item1" />
      <textarea aria-label="item2" />
      <input type="submit" aria-label="item3" />
      <input type="text" aria-label="item4" />
      <input type="text" disabled aria-label="item5" />
      <input type="text" readOnly aria-label="item6" />
    </>
  );
  expect(isTextField(screen.getByLabelText("item1"))).toBe(false);
  expect(isTextField(screen.getByLabelText("item2"))).toBe(true);
  expect(isTextField(screen.getByLabelText("item3"))).toBe(false);
  expect(isTextField(screen.getByLabelText("item4"))).toBe(true);
  expect(isTextField(screen.getByLabelText("item5"))).toBe(true);
  expect(isTextField(screen.getByLabelText("item6"))).toBe(true);
});

test("getNativeElementType", () => {
  render(
    <>
      <div />
      <span />
    </>
  );
  expect(getNativeElementType(document.querySelector("div"))).toBe("div");
  expect(getNativeElementType(document.querySelector("span"))).toBe("span");
  expect(
    getNativeElementType(document.querySelector("button"))
  ).toBeUndefined();
  expect(getNativeElementType(document.querySelector("button"), "button")).toBe(
    "button"
  );
  expect(
    getNativeElementType(document.querySelector("button"), () => null)
  ).toBeUndefined();
});
