import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
test("keeps edited notes with each contributor after reordering and insertion", async () => {
  await click(q.textbox("Ada notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Ready for review");
  await click(q.textbox("Grace notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Tests complete");
  await click(q.button("Reverse rows"));

  expect(q.cell.all(/^(Ada|Grace)$/).map((cell) => cell.textContent)).toEqual([
    "Grace",
    "Ada",
  ]);
  expect(q.textbox("Ada notes")).toHaveValue("Ready for review");
  expect(q.textbox("Grace notes")).toHaveValue("Tests complete");

  await click(q.button("Add contributor"));

  expect(
    q.cell.all(/^(Ada|Grace|Katherine)$/).map((cell) => cell.textContent),
  ).toEqual(["Katherine", "Grace", "Ada"]);
  expect(q.textbox("Katherine notes")).toHaveValue("");
  expect(q.textbox("Ada notes")).toHaveValue("Ready for review");
  expect(q.textbox("Grace notes")).toHaveValue("Tests complete");
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
test("renders column cells without the reserved row metadata", () => {
  expect(q.columnheader.all().map((cell) => cell.textContent)).toEqual([
    "Contributor",
    "Hours",
    "Notes",
  ]);
  expect(q.within(q.row(/^Ada /)).cell.all()).toHaveLength(3);
  expect(q.within(q.row(/^Grace /)).cell.all()).toHaveLength(3);
  expect(q.rowheader("Total")).toHaveAttribute("scope", "row");
  expect(q.within(q.row(/^Total /)).cell.all()).toHaveLength(2);
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
test("keeps missing hours under their header when adding a contributor", async () => {
  await click(q.button("Add contributor"));

  const row = q.row(/^Katherine\b/);
  expect(Array.from(row.children, (cell) => cell.textContent)).toEqual([
    "Katherine",
    "",
    "",
  ]);
  expect(row.lastElementChild).toContainElement(q.textbox("Katherine notes"));
  expect(q.textbox("Katherine notes")).toHaveValue("");
});

// Explicit zero must not share an identity with an unkeyed row at index zero.
test("keeps keyed row edits when unkeyed rows change position", async () => {
  await click(q.textbox("Assigned task notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Ready to assign");
  await click(q.button("Reverse task rows"));

  expect(
    q.cell.all(/^(Draft|Assigned) task$/).map((cell) => cell.textContent),
  ).toEqual(["Assigned task", "Draft task"]);
  expect(q.textbox("Assigned task notes")).toHaveValue("Ready to assign");
  expect(q.textbox("Draft task notes")).toHaveValue("Draft");
});
