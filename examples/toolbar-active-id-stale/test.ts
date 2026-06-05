import { expect, test, click, press, q } from "../../browser-test-utils.ts";
// https://github.com/ariakit/ariakit/issues/3232

function setup() {
  const before = document.createElement("button");
  before.textContent = "Before";
  document.body.prepend(before);
  return () => {
    before.remove();
  };
}

test("toolbar is still accessible with stale activeId", async () => {
  const cleanup = setup();

  await press.Tab();
  expect(q.button("Before")).toHaveFocus();
  await press.Tab();
  expect(q.button("Bold")).toHaveFocus();
  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
  await click(q.button("Toggle Italic"));
  await press.ShiftTab();
  expect(q.button("Underline")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Before")).toHaveFocus();
  await press.Tab();
  expect(q.button("Underline")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.button("Bold")).toHaveFocus();

  cleanup();
});
