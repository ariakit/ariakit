import { click, q, type } from "@ariakit/test";

test("not call the onFocus callback on every key pressed", async () => {
  await click(q.combobox());
  await type("Applee");
  expect(q.text("Number of onFocus calls: 1")).toBeVisible();
  await type("e");
  expect(q.text("Number of onFocus calls: 1")).toBeVisible();
  await type("e");
  expect(q.text("Number of onFocus calls: 1")).toBeVisible();
  await click(document.body);
  expect(q.combobox()).not.toHaveFocus();
  await click(q.combobox());
  expect(q.text("Number of onFocus calls: 2")).toBeVisible();
});
