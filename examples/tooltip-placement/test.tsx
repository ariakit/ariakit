import { blur, getByRole, hover, press, render } from "ariakit-test";
import Example from ".";

test("show tooltip on hover", async () => {
  const { baseElement } = render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getByRole("tooltip", { hidden: true })).toBeVisible();
  await hover(baseElement);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus", async () => {
  render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  expect(getByRole("tooltip", { hidden: true })).toBeVisible();
  await blur();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});
