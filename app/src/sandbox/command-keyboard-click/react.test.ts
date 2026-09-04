// @vitest-environment jsdom

import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const NO_POINTER_CLICK =
  'PointerEvent, own window, pointerId -1, pointerType ""';

function getClickEvents() {
  return q
    .within(q.list("Document click events"))
    .listitem.all()
    .map((item) => item.textContent);
}

// https://github.com/ariakit/ariakit/issues/7395
test("Enter activation works in Vitest's non-VM jsdom environment", async () => {
  expect(document.defaultView).toBe(window);
  expect(window).not.toBeInstanceOf(Window);

  await focus(q.button("Report click"));
  await press.Enter();

  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});

// https://github.com/ariakit/ariakit/issues/7395
test("Space activation works in Vitest's non-VM jsdom environment", async () => {
  expect(document.defaultView).toBe(window);
  expect(window).not.toBeInstanceOf(Window);

  await focus(q.button("Report click"));
  await press.Space();

  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});
