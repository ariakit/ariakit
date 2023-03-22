import { click, getByRole, render, type } from "@ariakit/test";
import Example from "./index.js";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });
const getDisclosure = (name: string) => getByRole("button", { name });

test("show and hide popup with disclosure button", async () => {
  render(<Example />);
  await click(getDisclosure("Show popup"));
  expect(getPopover()).toBeVisible();
  await click(getDisclosure("Hide popup"));
  expect(getPopover()).not.toBeVisible();
});

test("keep focus on combobox if disclosure button pressed", async () => {
  render(<Example />);
  await click(getDisclosure("Show popup"));
  await type("abc");
  expect(getCombobox()).toHaveFocus();
  await click(getDisclosure("Hide popup"));
  expect(getCombobox()).toHaveFocus();
});
