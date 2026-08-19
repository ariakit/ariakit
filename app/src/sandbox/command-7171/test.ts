import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { NO_POINTER_CLICK } from "./no-pointer-click.ts";

function getClickEvents() {
  return q
    .within(q.list("Document click events"))
    .listitem.all()
    .map((item) => item.textContent);
}

// https://github.com/ariakit/ariakit/issues/7171
//
// The realm half of this behavior is covered only by `test-browser.ts`, because
// happy-dom shares one set of constructors between a frame and its parent.
test("Enter dispatches a PointerEvent with no pointer behind it", async () => {
  await focus(q.button("Report click"));
  await press.Enter();
  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});

// https://github.com/ariakit/ariakit/issues/7171
//
// Space dispatches the click from the keyup handler, a separate path from
// Enter's keydown handler in `Command`.
test("Space dispatches a PointerEvent with no pointer behind it", async () => {
  await focus(q.button("Report click"));
  await press.Space();
  expect(getClickEvents()).toEqual([NO_POINTER_CLICK]);
});
