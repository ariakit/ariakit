import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves focus into the next question and back to the answer", async () => {
  expect(q.button("Next")).toBeDisabled();
  await click(q.text("React"));
  expect(q.radio("React Recommended")).toBeChecked();
  await click(q.button("Next"));
  const server = q.radio("On the server Recommended");
  expect(server).toHaveFocus();
  expect(server).not.toBeChecked();
  await click(q.button("Back"));
  expect(q.radio("React Recommended")).toHaveFocus();
  expect(q.radio("React Recommended")).toBeChecked();
});

test("clears the answer to the current question", async () => {
  await click(q.text("Solid"));
  expect(q.radio("Solid")).toBeChecked();
  const clear = q.button("Clear");
  await click(clear);
  expect(q.radio("Solid")).not.toBeChecked();
  expect(q.button("Next")).toBeDisabled();
  expect(clear).toHaveAttribute("aria-disabled", "true");
  expect(clear).toHaveFocus();
});

test("sends the answers as a reply and changes them", async () => {
  await click(q.text("React"));
  await click(q.button("Next"));
  await click(q.text("At build time"));
  await click(q.button("Send answers"));
  expect(q.text("React, At build time")).toBeVisible();
  const change = q.button("Change answers");
  expect(change).toHaveFocus();
  await click(change);
  expect(q.radio("React Recommended")).toHaveFocus();
  expect(q.radio("React Recommended")).toBeChecked();
});
