import { ComponentProps } from "react";
import {
  isHTMLElement,
  isDisabled,
  hasTabIndex,
  hasNegativeTabIndex
} from "../tabbable";

function h<T extends keyof JSX.IntrinsicElements>(
  type: T,
  props: ComponentProps<T> = {} as any
) {
  const element = document.createElement(type);
  const keys = Object.keys(props);
  for (const prop of keys) {
    const value = props[prop as keyof typeof props];
    // @ts-ignore
    element[prop] = value;
    element.setAttribute(prop.toLowerCase(), value.toString());
  }
  return element;
}

test("isHTMLElement", () => {
  expect(
    isHTMLElement(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
  ).toBe(false);
  expect(isHTMLElement(h("div"))).toBe(true);
});

test("isDisabled", () => {
  expect(isDisabled(h("input"))).toBe(false);
  expect(isDisabled(h("input", { disabled: true }))).toBe(true);
});

test("hasTabIndex", () => {
  expect(hasTabIndex(h("div"))).toBe(false);
  expect(hasTabIndex(h("div", { tabIndex: -1 }))).toBe(true);
});

test("hasNegativeTabIndex", () => {
  expect(hasNegativeTabIndex(h("div"))).toBe(false);
  expect(hasNegativeTabIndex(h("div", { tabIndex: 0 }))).toBe(false);
  expect(hasNegativeTabIndex(h("div", { tabIndex: -1 }))).toBe(true);
});
