import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getDisclosure = () => getByRole("link", { name: "Tweet" });
const getDialog = () => queryByRole("dialog", { name: "Tweet" });
const getInput = () => queryByRole("textbox", { name: "Tweet text" });

test("show/hide on disclosure click", async () => {
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
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await press.Escape();
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  await click(document.body);
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});
