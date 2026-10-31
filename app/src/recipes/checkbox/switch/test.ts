import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("exposes each setting as a named and described switch", () => {
  const group = q.within(q.group("Connections"));
  const wifi = group.switch("Wi-Fi");
  expect(wifi).toBeChecked();
  expect(wifi).toHaveAccessibleDescription(
    "Connect to known networks automatically",
  );
  expect(group.switch("Bluetooth")).not.toBeChecked();
  expect(group.switch("Location")).toBeChecked();
});

test("turns a switch on and off with a click on its label", async () => {
  const bluetooth = q.switch("Bluetooth");
  await click(q.text("Bluetooth"));
  expect(bluetooth).toBeChecked();
  await click(q.text("Bluetooth"));
  expect(bluetooth).not.toBeChecked();
});
