import { click, getByRole, press, queryByRole, render } from "@ariakit/test";
import Example from "./index.jsx";

const getDisclosure = () => getByRole("link", { name: "Tweet" });
const getDialog = () => queryByRole("dialog", { name: "Tweet" });
const getInput = () => queryByRole("textbox", { name: "Tweet text" });

test("show/hide on disclosure click", async () => {
  render(<Example />);
  expect(getDialog()).not.toBeInTheDocument();
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  expect(getInput()).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on escape", async () => {
  render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Escape();
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on click outside", async () => {
  const { baseElement } = render(<Example />);
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(baseElement);
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});
