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

// https://github.com/ariakit/ariakit/issues/7192
test("keyboard clicks cross a shadow boundary", async () => {
  const host = document.querySelector("[data-shadow-host]");
  const command = host?.shadowRoot?.querySelector<HTMLElement>("[role=button]");
  if (!command) throw new Error("Shadow command is not available");
  await focus(command);

  await press.Enter(command);
  expect(q.status()).toHaveTextContent("Outer shadow clicks: 1");

  await press.Space(command);
  expect(q.status()).toHaveTextContent("Outer shadow clicks: 2");
});
