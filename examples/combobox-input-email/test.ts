import { click, press, q, type } from "@ariakit/test";

test("combobox should not throw when input type=email", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await type("e");
  await press.ArrowDown();
  expect(q.option("email1@ariakit.org")).toHaveFocus();
});
