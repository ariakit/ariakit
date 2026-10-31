import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names a field by its label and describes it by its description", async () => {
  const box = q.within(q.article("Field with description"));
  const checkbox = box.checkbox();
  expect(checkbox).toHaveAccessibleName("Product updates");
  expect(checkbox).toHaveAccessibleDescription(
    "New features and changes to the API",
  );
  // The label points at the input, so the name doesn't depend on the label
  // wrapping it.
  expect(checkbox.closest("label")).toHaveAttribute("for", checkbox.id);
  // The description is still part of the row, so clicking it toggles the box.
  await click(box.text("New features and changes to the API"));
  expect(checkbox).not.toBeChecked();
});

test("describes a field by its own description id, then by the app hint", () => {
  const checkbox = q.within(q.article("Field with app ids")).checkbox();
  expect(checkbox).toHaveAccessibleName("Usage reports");
  expect(checkbox).toHaveAccessibleDescription(
    "Anonymous crash and usage data You can change this later in settings",
  );
});

test("leaves a field without a description undescribed", () => {
  const checkbox = q.within(q.article("Checkbox field")).checkbox();
  expect(checkbox).toHaveAccessibleName("Remember me");
  expect(checkbox).not.toHaveAttribute("aria-describedby");
});

test("names a card by its label and describes it by its description", async () => {
  const box = q.within(q.article("Card with description"));
  const checkbox = box.checkbox();
  expect(checkbox).toHaveAccessibleName("Analytics");
  expect(checkbox).toHaveAccessibleDescription(
    "Usage, retention and funnel reports, refreshed every hour",
  );
  await click(
    box.text("Usage, retention and funnel reports, refreshed every hour"),
  );
  expect(checkbox).not.toBeChecked();
});

test("sets the switch role from the switch mark on each component", () => {
  const fields = q.within(q.article("Switch mark"));
  expect(fields.switch("Off")).not.toBeChecked();
  expect(fields.switch("On")).toBeChecked();
  const bare = q.within(q.article("Switch mark sizes"));
  expect(bare.switch("md")).not.toBeChecked();
  const cards = q.within(q.article("Switch cards"));
  expect(cards.switch("On")).toBeChecked();
  expect(cards.switch("Off")).not.toBeChecked();
});

test("keeps a role that the app gives to a switch mark", () => {
  const fields = q.within(q.article("Switch mark"));
  expect(fields.checkbox("Mixed")).toBePartiallyChecked();
  expect(fields.switch.maybe("Mixed")).not.toBeInTheDocument();
  const cards = q.within(q.article("Switch cards"));
  expect(cards.checkbox("Checkbox role")).not.toBeChecked();
  expect(cards.switch.maybe("Checkbox role")).not.toBeInTheDocument();
});

test("keeps the switch role when the app passes an undefined role", () => {
  const fields = q.within(q.article("Switch mark"));
  expect(fields.switch("Optional role")).not.toBeChecked();
  const cards = q.within(q.article("Switch cards"));
  expect(cards.switch("Optional props")).not.toBeChecked();
});

test("keeps the checkbox role for the other marks", () => {
  expect(q.within(q.article("Checkbox field")).checkbox()).toBeInTheDocument();
  expect(q.within(q.article("Checkbox card")).checkbox()).toBeInTheDocument();
});

test("keeps the ids that the app gives to the fields", () => {
  const box = q.within(q.article("Select all"));
  const children = q.within(box.group("Features")).checkbox.all();
  // The parent references its children by the ids that the app passes to them.
  const controls = box.checkbox("All features").getAttribute("aria-controls");
  expect(controls?.split(" ")).toEqual(children.map((child) => child.id));
  for (const child of children) {
    expect(child.closest("label")).toHaveAttribute("for", child.id);
  }
});
