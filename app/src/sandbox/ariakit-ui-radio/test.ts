import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names a field by its label and describes it by its description", async () => {
  const box = q.within(q.article("Descriptions"));
  const hobby = box.radio("Hobby");
  expect(hobby).toHaveAccessibleDescription(
    "For side projects and experiments",
  );
  // The label points at the input, so the name doesn't depend on the label
  // wrapping it.
  expect(hobby.closest("label")).toHaveAttribute("for", hobby.id);
  // The description is still part of the row, so clicking it checks the radio.
  await click(box.text("For side projects and experiments"));
  expect(hobby).toBeChecked();
});

test("leaves a field without a description undescribed", () => {
  const radio = q.within(q.article("Group")).radio("Pro");
  expect(radio).not.toHaveAttribute("aria-describedby");
});

test("names a card by its label and describes it by its description", async () => {
  const box = q.within(q.article("Cards"));
  const hobby = box.radio("Hobby");
  expect(hobby).toHaveAccessibleDescription(
    "For side projects and experiments",
  );
  await click(box.text("For side projects and experiments"));
  expect(hobby).toBeChecked();
});
