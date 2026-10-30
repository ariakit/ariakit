import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

const names = ["Contacts", "Messages", "Files", "Calendar events"];

test("starts in the mixed state and checks all items from it", async () => {
  const all = q.checkbox("All data");
  expect(all).toBePartiallyChecked();
  expect(q.checkbox("Messages")).toBeChecked();
  expect(q.checkbox("Files")).not.toBeChecked();
  await click(all);
  expect(all).toBeChecked();
  for (const name of names) {
    expect(q.checkbox(name)).toBeChecked();
  }
  await click(all);
  expect(all).not.toBeChecked();
  expect(all).not.toBePartiallyChecked();
  for (const name of names) {
    expect(q.checkbox(name)).not.toBeChecked();
  }
});

test("follows the state of the items", async () => {
  const all = q.checkbox("All data");
  await click(q.text("Messages"));
  expect(all).not.toBeChecked();
  expect(all).not.toBePartiallyChecked();
  await click(q.text("Files"));
  expect(all).toBePartiallyChecked();
  for (const name of ["Contacts", "Messages", "Calendar events"]) {
    await click(q.text(name));
  }
  expect(all).toBeChecked();
  expect(all).not.toBePartiallyChecked();
});

test("lists the items in aria-controls", () => {
  const ids = names.map((name) => q.checkbox(name).id);
  expect(q.checkbox("All data")).toHaveAttribute(
    "aria-controls",
    ids.join(" "),
  );
});
