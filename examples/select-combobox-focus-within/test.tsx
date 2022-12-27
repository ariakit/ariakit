import {
  click,
  getByPlaceholderText,
  getByRole,
  press,
  queryByRole,
  render,
  type,
} from "@ariakit/test";
import Example from ".";

const getSelect = () => getByRole("combobox", { name: "Favorite fruit" });
const getPopover = () => queryByRole("dialog", { hidden: true });
const getCombobox = () => getByPlaceholderText("Search...");
const getCancelButton = () => getByRole("button", { name: "Clear input" });
const getOption = (name: string) => getByRole("option", { name });

test("show/hide cancel button", async () => {
  render(
    <>
      <Example />
      <button>External button</button>
    </>
  );
  await click(getSelect());
  expect(getCombobox()).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await press.Tab();
  expect(getCancelButton()).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await press.Enter();
  expect(getCombobox()).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await press.ShiftTab();
  expect(getSelect()).toHaveFocus();
  expect(getCancelButton()).not.toHaveAttribute("data-visible");
  await type("b");
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Bacon")).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await type("ho");
  await press.ShiftTab();
  expect(getSelect()).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await click(getCancelButton());
  expect(getCombobox()).toHaveFocus();
  expect(getCancelButton()).toHaveAttribute("data-visible");
  await press.Tab();
  await press.Tab();
  expect(getPopover()).not.toBeInTheDocument();
});

test("show focus-within styles", async () => {
  render(
    <>
      <Example />
      <button>External button</button>
    </>
  );
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Tab();
  expect(getByRole("group")).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(getByRole("group")).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  await press.Tab();
  expect(getByRole("group")).not.toHaveClass("focus-within");
});
