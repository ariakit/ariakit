import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each amenity with its word, not its icon, and toggles it", async () => {
  const group = q.within(q.group("Amenities"));
  expect(group.checkbox("Wi-Fi")).toBeChecked();
  expect(group.checkbox("Pets allowed")).not.toBeChecked();
  await click(group.text("Pets allowed"));
  expect(group.checkbox("Pets allowed")).toBeChecked();
  await click(group.text("Wi-Fi"));
  expect(group.checkbox("Wi-Fi")).not.toBeChecked();
});
