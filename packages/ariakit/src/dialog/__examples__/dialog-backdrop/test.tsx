import { click, getByRole, render, screen } from "ariakit-test";
import Example from ".";

const getDisclosure = () => getByRole("button", { name: "View details" });
const getDialog = () => getByRole("dialog", { hidden: true });
const getDismiss = () => getByRole("button", { name: "Dismiss popup" });
const getBackdrop = () => screen.getByTestId("backdrop");

test("show the custom backdrop", async () => {
  render(<Example />);
  expect(getDialog()).not.toBeVisible();
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
  expect(getBackdrop()).toBeVisible();
  expect(getDismiss()).toHaveFocus();
});
