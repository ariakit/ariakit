import { blur, getByRole, hover, press } from "@ariakit/test";

test("show tooltip on hover", async () => {
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getByRole("tooltip", { hidden: true })).toBeVisible();
  await hover(document.body);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus", async () => {
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  expect(getByRole("tooltip", { hidden: true })).toBeVisible();
  await blur();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});
