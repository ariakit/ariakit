import { click, hover, press, q, type } from "@ariakit/test";

test("default value", () => {
  expect(q.combobox("Account")).toHaveTextContent(/John Doe/);
});

test("set value on move", async () => {
  await click(q.combobox("Account"));
  expect(q.option(/John Doe/)).toHaveFocus();
  await press.ArrowUp();
  expect(q.option(/Jane Doe/)).toHaveFocus();
  expect(q.combobox("Account")).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  expect(q.combobox("Account")).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  await hover(q.option(/Harry Poe/));
  expect(q.combobox("Account")).toHaveTextContent(/Jane Doe/);
  await press.End();
  expect(q.option(/Sonia Poe/)).toHaveFocus();
  expect(q.combobox("Account")).toHaveTextContent(/Sonia Poe/);
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Account")).toHaveTextContent(/Jane Doe/);
});

test("typeahead", async () => {
  expect(q.combobox("Account")).toHaveTextContent(/John Doe/);
  await press.Tab();
  await type("jjj");
  expect(q.combobox("Account")).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  expect(q.option(/Jane Doe/)).toHaveFocus();
  await type("harry");
  expect(q.combobox("Account")).toHaveTextContent(/Harry Poe/);
});
