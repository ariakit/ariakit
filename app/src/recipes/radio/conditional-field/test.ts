import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the field after the group only while Other is checked", async () => {
  expect(
    q.textbox.maybe("Where did you hear about us?"),
  ).not.toBeInTheDocument();
  await click(q.radio("Other"));
  expect(q.textbox("Where did you hear about us?")).toBeVisible();
  // Focus stays on the radio, and Tab moves into the field next.
  expect(q.radio("Other")).toHaveFocus();
  await press.Tab();
  expect(q.textbox("Where did you hear about us?")).toHaveFocus();
  await click(q.radio("Social media"));
  expect(
    q.textbox.maybe("Where did you hear about us?"),
  ).not.toBeInTheDocument();
});

test("keeps the field out of the radio group", async () => {
  await click(q.radio("Other"));
  expect(q.textbox("Where did you hear about us?")).toBeVisible();
  const group = q.within(q.radiogroup("How did you hear about us?"));
  expect(
    group.textbox.maybe("Where did you hear about us?"),
  ).not.toBeInTheDocument();
});

test("keeps the typed text when Other is checked again", async () => {
  await click(q.radio("Other"));
  await type("Podcast", q.textbox("Where did you hear about us?"));
  await click(q.radio("Social media"));
  await click(q.radio("Other"));
  expect(q.textbox("Where did you hear about us?")).toHaveValue("Podcast");
});
