import { click, getByRole, type } from "@ariakit/test";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });
const getDisclosure = (name: string) => getByRole("button", { name });

test("show and hide popup with disclosure button", async () => {
  await click(getDisclosure("Show popup"));
  expect(getPopover()).toBeVisible();
  await click(getDisclosure("Hide popup"));
  expect(getPopover()).not.toBeVisible();
});

test("keep focus on combobox if disclosure button pressed", async () => {
  await click(getDisclosure("Show popup"));
  await type("abc");
  expect(getCombobox()).toHaveFocus();
  await click(getDisclosure("Hide popup"));
  expect(getCombobox()).toHaveFocus();
});
