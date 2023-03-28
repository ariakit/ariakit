import { click, getByRole, getByText, hover } from "@ariakit/test";

const getSelect = () => getByRole("combobox", { name: "Favorite food" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) =>
  getByText(name, { selector: "[role=option]" });

test("hover on item", async () => {
  await click(getSelect());
  await hover(getOption("Banana"));
  expect(getOption("Banana")).toHaveFocus();
  await hover(getByText("Dairy"));
  expect(getOption("Banana")).not.toHaveFocus();
  expect(getList()).toHaveFocus();
  expect(getList()).not.toHaveAttribute("aria-activedescendant");
  await hover(getOption("Banana"));
  expect(getOption("Banana")).toHaveFocus();
});
