import { click, getByRole, hover, press, type } from "@ariakit/test";

const getSelect = () => getByRole("combobox", { name: "Account" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string | RegExp) => getByRole("option", { name });

test("default value", () => {
  expect(getSelect()).toHaveTextContent(/John Doe/);
});

test("set value on move", async () => {
  await click(getSelect());
  expect(getOption(/John Doe/)).toHaveFocus();
  await press.ArrowUp();
  expect(getOption(/Jane Doe/)).toHaveFocus();
  expect(getSelect()).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  expect(getSelect()).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  await hover(getOption(/Harry Poe/));
  expect(getSelect()).toHaveTextContent(/Jane Doe/);
  await press.End();
  expect(getOption(/Sonia Poe/)).toHaveFocus();
  expect(getSelect()).toHaveTextContent(/Sonia Poe/);
  await press.Escape();
  expect(getList()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent(/Jane Doe/);
});

test("typeahead", async () => {
  expect(getSelect()).toHaveTextContent(/John Doe/);
  await press.Tab();
  await type("jjj");
  expect(getSelect()).toHaveTextContent(/Jane Doe/);
  await press.Enter();
  expect(getOption(/Jane Doe/)).toHaveFocus();
  await type("harry");
  expect(getSelect()).toHaveTextContent(/Harry Poe/);
});
