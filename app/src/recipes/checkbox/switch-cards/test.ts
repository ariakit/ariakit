import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("exposes each card as a named and described switch", () => {
  const group = q.within(q.group("Channels"));
  const email = group.switch("Email");
  expect(email).toBeChecked();
  expect(email).toHaveAccessibleDescription("A summary of each day");
  expect(group.switch("Push")).not.toBeChecked();
  expect(group.switch("Calendar")).toBeChecked();
});

test("turns a card's switch on and off with a click on the card", async () => {
  const push = q.switch("Push");
  await click(q.text("Push"));
  expect(push).toBeChecked();
  await click(q.text("Push"));
  expect(push).not.toBeChecked();
});
