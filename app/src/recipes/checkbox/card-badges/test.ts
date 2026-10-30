import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reads the badge after the add-on name and the price last", async () => {
  const group = q.within(q.group("Add-ons"));
  const setup = group.checkbox("Home setup New $29");
  expect(setup).not.toBeChecked();
  expect(setup).toHaveAccessibleDescription(
    "A technician sets up the device and moves your data",
  );
  await click(group.text("Home setup"));
  expect(setup).toBeChecked();
  expect(group.checkbox("Gift wrap $5")).not.toBeChecked();
});
