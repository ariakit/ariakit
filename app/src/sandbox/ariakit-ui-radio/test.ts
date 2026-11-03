import { click, press, q } from "@ariakit/test";
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

test("names the cards of a grid by the group around it and moves between them", async () => {
  const box = q.within(q.article("Cards"));
  // The grid only lays out the cards, so the group is the only radio group.
  expect(box.radiogroup.all()).toHaveLength(1);
  const group = q.within(box.radiogroup("Plan"));
  expect(group.radio.all()).toHaveLength(3);
  expect(group.radio("Pro")).toBeChecked();
  await click(group.text("Hobby"));
  expect(group.radio("Hobby")).toBeChecked();
  await press.ArrowDown();
  expect(group.radio("Pro")).toHaveFocus();
  expect(group.radio("Pro")).toBeChecked();
});
