// @vitest-environment jsdom
/// <reference types="vitest/jsdom" />

import { focus, press, q } from "@ariakit/test";
import { expect, onTestFinished, test } from "vitest";

const NO_POINTER_CLICK =
  'PointerEvent, own window, pointerId -1, pointerType ""';

function getClickEvents() {
  return q
    .within(q.list("Document click events"))
    .listitem.all()
    .map((item) => item.textContent);
}

function restoreJsdomWindow() {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    document,
    "defaultView",
  );
  if (!originalDescriptor) {
    throw new Error("document.defaultView descriptor is not available");
  }
  // TODO: Remove once https://github.com/ariakit/ariakit/issues/7395 is fixed.
  Object.defineProperty(document, "defaultView", {
    configurable: true,
    value: jsdom.window,
  });
  onTestFinished(() => {
    Object.defineProperty(document, "defaultView", originalDescriptor);
  });
}

// https://github.com/ariakit/ariakit/issues/7395
test("Enter activation works in Vitest's non-VM jsdom environment", async () => {
  expect(document.defaultView).toBe(window);
  expect(window).not.toBeInstanceOf(Window);
  restoreJsdomWindow();

  await focus(q.button("Report click"));
  await press.Enter();

  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});

// https://github.com/ariakit/ariakit/issues/7395
test("Space activation works in Vitest's non-VM jsdom environment", async () => {
  expect(document.defaultView).toBe(window);
  expect(window).not.toBeInstanceOf(Window);
  restoreJsdomWindow();

  await focus(q.button("Report click"));
  await press.Space();

  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});
