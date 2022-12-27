import { click, getByRole, getByText, hover, render } from "@ariakit/test";
import Example from ".";

const getSelect = () => getByRole("combobox", { name: "Favorite food" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) =>
  getByText(name, { selector: "[role=option]" });

test("hover on item", async () => {
  render(<Example />);
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
