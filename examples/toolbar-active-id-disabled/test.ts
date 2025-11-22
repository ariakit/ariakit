// https://github.com/ariakit/ariakit/issues/3232
import { press, q } from "@ariakit/test";

beforeEach(() => {
  const before = document.createElement("button");
  before.textContent = "Before";
  const after = before.cloneNode() as HTMLDivElement;
  after.textContent = "After";
  document.body.prepend(before);
  document.body.append(after);
  return () => {
    before.remove();
    after.remove();
  };
})

test("toolbar is still accessible with disabled activeId", async () => {
  await press.Tab();
  expect(q.button("Before")).toHaveFocus();
  await press.Tab();
  expect(q.button("Italic")).toHaveFocus();
  await press.Tab();
  expect(q.button("After")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Italic")).toHaveFocus();
});
