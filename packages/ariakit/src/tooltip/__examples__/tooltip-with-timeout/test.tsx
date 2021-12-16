import {
  blur,
  getByRole,
  hover,
  press,
  render,
  waitFor,
} from "ariakit-test-utils";
import Example from ".";

test("show tooltip on hover after timeout", async () => {
  const { baseElement } = render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  await waitFor(expect(getByRole("tooltip", { hidden: true })).toBeVisible, {
    timeout: 2000,
  });
  await hover(baseElement);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus after timeout", async () => {
  render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  await waitFor(expect(getByRole("tooltip", { hidden: true })).toBeVisible, {
    timeout: 2000,
  });
  await blur();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});
