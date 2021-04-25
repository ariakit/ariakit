import "reakit-test-utils/mockClientRects";
import * as React from "react";
import { render, focus, screen } from "reakit-test-utils";
import { isFocusable, isTabbable, hasFocus, hasFocusWithin } from "../focus";

function h<T extends keyof JSX.IntrinsicElements>(
  type: T,
  props: React.ComponentProps<T> = {} as any
) {
  const element = document.createElement(type);
  const keys = Object.keys(props);
  for (const prop of keys) {
    const value = props[prop as keyof typeof props];
    // @ts-ignore
    element[prop] = value;
    element.setAttribute(prop.toLowerCase(), `${value}`);
  }
  return element;
}

test("isFocusable", () => {
  expect(
    isFocusable(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
  ).toBe(false);
  expect(isFocusable(h("input"))).toBe(true);
  expect(isFocusable(h("input", { tabIndex: -1 }))).toBe(true);
  expect(isFocusable(h("input", { hidden: true }))).toBe(false);
  expect(isFocusable(h("input", { disabled: true }))).toBe(false);
  expect(isFocusable(h("a"))).toBe(false);
  expect(isFocusable(h("a", { href: "" }))).toBe(true);
  expect(isFocusable(h("audio"))).toBe(false);
  expect(isFocusable(h("audio", { controls: true }))).toBe(true);
  expect(isFocusable(h("video"))).toBe(false);
  expect(isFocusable(h("video", { controls: true }))).toBe(true);
  expect(isFocusable(h("div"))).toBe(false);
  expect(isFocusable(h("div", { contentEditable: true }))).toBe(true);
  expect(isFocusable(h("div", { tabIndex: 0 }))).toBe(true);
  expect(isFocusable(h("div", { tabIndex: -1 }))).toBe(true);
});

test("isTabbable", () => {
  expect(
    isTabbable(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
  ).toBe(false);
  expect(isTabbable(h("input"))).toBe(true);
  expect(isTabbable(h("input", { tabIndex: -1 }))).toBe(false);
  expect(isTabbable(h("input", { hidden: true }))).toBe(false);
  expect(isTabbable(h("input", { disabled: true }))).toBe(false);
  expect(isTabbable(h("a"))).toBe(false);
  expect(isTabbable(h("a", { href: "" }))).toBe(true);
  expect(isTabbable(h("audio"))).toBe(false);
  expect(isTabbable(h("audio", { controls: true }))).toBe(true);
  expect(isTabbable(h("video"))).toBe(false);
  expect(isTabbable(h("video", { controls: true }))).toBe(true);
  expect(isTabbable(h("div"))).toBe(false);
  expect(isTabbable(h("div", { contentEditable: true }))).toBe(true);
  expect(isTabbable(h("div", { tabIndex: 0 }))).toBe(true);
  expect(isTabbable(h("div", { tabIndex: -1 }))).toBe(false);
});

test("hasFocus", () => {
  render(
    <>
      <div aria-label="item1">
        <button aria-label="item1-1" />
      </div>
      <button aria-label="item2" />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div aria-label="item3" tabIndex={0} aria-activedescendant="item3-1">
        <div aria-label="item3-1" id="item3-1" />
      </div>
    </>
  );
  expect(hasFocus(screen.getByLabelText("item1"))).toBe(false);
  focus(screen.getByLabelText("item1-1"));
  expect(hasFocus(screen.getByLabelText("item1"))).toBe(false);
  expect(hasFocus(screen.getByLabelText("item1-1"))).toBe(true);
  expect(hasFocus(screen.getByLabelText("item2"))).toBe(false);
  focus(screen.getByLabelText("item2"));
  expect(hasFocus(screen.getByLabelText("item2"))).toBe(true);
  expect(hasFocus(screen.getByLabelText("item3-1"))).toBe(false);
  focus(screen.getByLabelText("item3"));
  expect(hasFocus(screen.getByLabelText("item3"))).toBe(true);
  expect(hasFocus(screen.getByLabelText("item3-1"))).toBe(true);
});

test("hasFocusWithin", () => {
  render(
    <>
      <div aria-label="item1">
        <button aria-label="item1-1" />
      </div>
      <button aria-label="item2" />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div aria-label="item3" tabIndex={0} aria-activedescendant="item3-1">
        <div aria-label="item3-1" id="item3-1" />
      </div>
    </>
  );
  expect(hasFocusWithin(screen.getByLabelText("item1"))).toBe(false);
  focus(screen.getByLabelText("item1-1"));
  expect(hasFocusWithin(screen.getByLabelText("item1"))).toBe(true);
  expect(hasFocusWithin(screen.getByLabelText("item2"))).toBe(false);
  focus(screen.getByLabelText("item2"));
  expect(hasFocusWithin(screen.getByLabelText("item2"))).toBe(true);
  expect(hasFocusWithin(screen.getByLabelText("item3-1"))).toBe(false);
  focus(screen.getByLabelText("item3"));
  expect(hasFocusWithin(screen.getByLabelText("item3"))).toBe(true);
  expect(hasFocusWithin(screen.getByLabelText("item3-1"))).toBe(true);
});
