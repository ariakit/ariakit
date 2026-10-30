import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("tells why the necessary cookies stay on", async () => {
  const group = q.within(q.group("Cookies"));
  const necessary = group.checkbox("Strictly necessary");
  expect(necessary).toBeChecked();
  expect(necessary).toBeDisabled();
  expect(necessary).toHaveAccessibleDescription(
    "Always on. Sign-in and security need these cookies.",
  );
  await click(group.text("Strictly necessary"));
  expect(necessary).toBeChecked();
});

test("toggles the other categories", async () => {
  const group = q.within(q.group("Cookies"));
  expect(group.checkbox("Analytics")).toBeChecked();
  await click(group.text("Marketing"));
  expect(group.checkbox("Marketing")).toBeChecked();
  await click(group.text("Analytics"));
  expect(group.checkbox("Analytics")).not.toBeChecked();
});
