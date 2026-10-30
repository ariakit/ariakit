import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("disables the other topics at the limit and tells why", async () => {
  const group = q.within(q.group("Pick up to 3 topics"));
  expect(q.status()).toHaveTextContent("2 of 3 picked.");
  expect(group.checkbox("Sales")).toBeEnabled();
  await click(group.text("Product"));
  expect(group.checkbox("Product")).toBeChecked();
  expect(q.status()).toHaveTextContent(
    "3 of 3 picked. Clear a topic to pick another.",
  );
  expect(group.checkbox("Sales")).toBeDisabled();
  expect(group.checkbox("Marketing")).toBeDisabled();
  expect(group.checkbox("Design")).toBeEnabled();
});

test("enables the other topics again when a topic is cleared", async () => {
  const group = q.within(q.group("Pick up to 3 topics"));
  await click(group.text("Product"));
  await click(group.text("Design"));
  expect(group.checkbox("Design")).not.toBeChecked();
  expect(group.checkbox("Sales")).toBeEnabled();
  expect(q.status()).toHaveTextContent("2 of 3 picked.");
  await click(group.text("Sales"));
  expect(group.checkbox("Sales")).toBeChecked();
});
