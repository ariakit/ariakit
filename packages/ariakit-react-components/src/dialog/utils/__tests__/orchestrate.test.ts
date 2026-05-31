import { afterEach, expect, test } from "vitest";
import { disableTreeOutside } from "../disable-tree.ts";
import { isElementMarked, markTreeOutside } from "../mark-tree-outside.ts";
import { assignStyle, setAttribute } from "../orchestrate.ts";
import { supportsInert } from "../supports-inert.ts";
import {
  createWalkTreeSnapshot,
  walkTreeOutside,
} from "../walk-tree-outside.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function getElement(id: string) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element not found: ${id}`);
  return element;
}

function getWalkedElementIds(id: string, elements: Array<Element | null>) {
  const ids: string[] = [];
  walkTreeOutside(id, elements, (element) => {
    ids.push(element.id);
  });
  return ids;
}

test("orchestrate restores cleanup stacks in LIFO order", () => {
  const element = document.createElement("div");
  element.setAttribute("data-value", "initial");

  const restoreOne = setAttribute(element, "data-value", "one");
  const restoreTwo = setAttribute(element, "data-value", "two");
  const restoreThree = setAttribute(element, "data-value", "three");

  expect(element.getAttribute("data-value")).toBe("three");

  restoreThree();

  expect(element.getAttribute("data-value")).toBe("two");

  restoreTwo();

  expect(element.getAttribute("data-value")).toBe("one");

  restoreOne();

  expect(element.getAttribute("data-value")).toBe("initial");
});

test("orchestrate defers the initial cleanup until it is current", () => {
  const element = document.createElement("div");
  element.setAttribute("role", "original");

  const restoreOne = setAttribute(element, "role", "one");
  const restoreTwo = setAttribute(element, "role", "two");

  restoreOne();

  expect(element.getAttribute("role")).toBe("two");

  restoreTwo();

  expect(element.getAttribute("role")).toBe("original");

  restoreOne();

  expect(element.getAttribute("role")).toBe("original");
});

test("orchestrate skips disposed entries when restoring previous cleanups", () => {
  const element = document.createElement("div");
  element.setAttribute("data-value", "initial");

  const restoreOne = setAttribute(element, "data-value", "one");
  const restoreTwo = setAttribute(element, "data-value", "two");
  const restoreThree = setAttribute(element, "data-value", "three");

  restoreTwo();

  expect(element.getAttribute("data-value")).toBe("three");

  restoreThree();

  expect(element.getAttribute("data-value")).toBe("one");

  restoreOne();

  expect(element.getAttribute("data-value")).toBe("initial");
});

test("orchestrate defers stale style cleanups", () => {
  const element = document.createElement("div");
  element.style.display = "flex";

  const restoreOne = assignStyle(element, { display: "block" });
  const restoreTwo = assignStyle(element, { display: "none" });

  restoreOne();

  expect(element.style.display).toBe("none");

  restoreTwo();

  expect(element.style.display).toBe("flex");
});

test("orchestrate keeps element and key cleanup stacks independent", () => {
  const element = document.createElement("div");
  const otherElement = document.createElement("div");

  const restoreElementValue = setAttribute(element, "data-value", "value");
  setAttribute(element, "data-other", "other");
  setAttribute(otherElement, "data-value", "other-value");

  restoreElementValue();

  expect(element.hasAttribute("data-value")).toBe(false);
  expect(element.getAttribute("data-other")).toBe("other");
  expect(otherElement.getAttribute("data-value")).toBe("other-value");
});

test("walkTreeOutside skips nested elements that share an ancestor", () => {
  document.body.innerHTML = `
    <div id="root">
      <section id="outside"></section>
      <div id="dialog">
        <button id="button"></button>
      </div>
      <section id="sibling"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const button = getElement("button");
  const walked: string[] = [];

  walkTreeOutside("dialog", [dialog, button], (element, originalElement) => {
    walked.push(`${originalElement.id}:${element.id}`);
  });

  expect(walked).toEqual(["dialog:outside", "dialog:sibling"]);
});

test("walkTreeOutside skips elements outside the active snapshot", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <section id="before"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const root = getElement("root");
  const restoreSnapshot = createWalkTreeSnapshot("dialog", [dialog]);
  const after = document.createElement("section");
  after.id = "after";
  root.append(after);

  expect(getWalkedElementIds("dialog", [dialog])).toEqual(["before"]);

  restoreSnapshot();

  expect(getWalkedElementIds("dialog", [dialog])).toEqual(["before", "after"]);
});

test("markTreeOutside skips backdrops and restores marks", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog" data-dialog></div>
      <section id="outside">
        <span id="outside-child"></span>
      </section>
      <div id="backdrop" data-backdrop="dialog"></div>
    </div>
  `;

  const dialog = getElement("dialog");
  const outside = getElement("outside");
  const outsideChild = getElement("outside-child");
  const backdrop = getElement("backdrop");

  const restoreMarks = markTreeOutside("dialog", [dialog]);

  expect(isElementMarked(outside, "dialog")).toBe(true);
  expect(isElementMarked(outsideChild, "dialog")).toBe(true);
  expect(isElementMarked(backdrop, "dialog")).toBe(false);

  restoreMarks();

  expect(isElementMarked(outside, "dialog")).toBe(false);
  expect(isElementMarked(outsideChild, "dialog")).toBe(false);
  expect(isElementMarked(backdrop, "dialog")).toBe(false);
});

test("markTreeOutside restores previous marks after nested cleanup", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog-one" data-dialog></div>
      <div id="dialog-two" data-dialog></div>
      <section id="outside"></section>
    </div>
  `;

  const dialogOne = getElement("dialog-one");
  const dialogTwo = getElement("dialog-two");
  const outside = getElement("outside");

  const restoreOne = markTreeOutside("one", [dialogOne]);
  const restoreTwo = markTreeOutside("two", [dialogTwo]);

  expect(isElementMarked(outside, "one")).toBe(true);
  expect(isElementMarked(outside, "two")).toBe(true);

  restoreTwo();

  expect(isElementMarked(outside, "one")).toBe(true);
  expect(isElementMarked(outside, "two")).toBe(false);

  restoreOne();

  expect(isElementMarked(outside, "one")).toBe(false);
  expect(isElementMarked(outside, "two")).toBe(false);
});

test("disableTreeOutside skips focus traps and restores disabled elements", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <span id="focus-trap" data-focus-trap="dialog"></span>
      <section id="outside">
        <button id="button">Button</button>
      </section>
    </div>
  `;

  const dialog = getElement("dialog");
  const focusTrap = getElement("focus-trap");
  const outside = getElement("outside");

  const restoreTree = disableTreeOutside("dialog", [dialog]);

  if (supportsInert()) {
    expect(outside.inert).toBe(true);
    expect(focusTrap.inert).toBe(false);
  } else {
    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(outside.style.pointerEvents).toBe("none");
    expect(focusTrap.hasAttribute("aria-hidden")).toBe(false);
    expect(focusTrap.style.pointerEvents).toBe("");
  }

  restoreTree();

  if (supportsInert()) {
    expect(outside.inert).toBe(false);
  } else {
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    expect(outside.style.pointerEvents).toBe("");
  }
});
