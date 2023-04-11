import { click, getByRole } from "@ariakit/test";

test("change controlled state", async () => {
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});
