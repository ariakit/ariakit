import { press, q } from "@ariakit/test";

test("navigate with keyboard", async () => {
  await press.Tab();
  expect(q.button("Undo")).toHaveFocus();
  await press.ArrowRight();
  expect(q.button("Bold")).toHaveFocus();
  await press.End();
  expect(q.button("Underline")).toHaveFocus();
  await press.Home();
  expect(q.button("Undo")).toHaveFocus();
  await press.ArrowDown();
  expect(q.button("Undo")).toHaveFocus();
  await press.ArrowUp();
  expect(q.button("Undo")).toHaveFocus();
});
