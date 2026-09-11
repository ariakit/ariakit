import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { TableFixturesExamples } from "./pages/table-fixtures.react.tsx";

mountExamples(TableFixturesExamples);

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
test("keeps edited notes with each contributor after reordering and insertion", async () => {
  const fixture = q.within(q.article("Table rows"));
  await click(fixture.textbox("Ada notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Ready for review");
  await click(fixture.textbox("Grace notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Tests complete");
  await click(fixture.button("Reverse rows"));

  expect(
    fixture.cell.all(/^(Ada|Grace)$/).map((cell) => cell.textContent),
  ).toEqual(["Grace", "Ada"]);
  expect(fixture.textbox("Ada notes")).toHaveValue("Ready for review");
  expect(fixture.textbox("Grace notes")).toHaveValue("Tests complete");

  await click(fixture.button("Add contributor"));

  expect(
    fixture.cell.all(/^(Ada|Grace|Katherine)$/).map((cell) => cell.textContent),
  ).toEqual(["Katherine", "Grace", "Ada"]);
  expect(fixture.textbox("Katherine notes")).toHaveValue("");
  expect(fixture.textbox("Ada notes")).toHaveValue("Ready for review");
  expect(fixture.textbox("Grace notes")).toHaveValue("Tests complete");
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
test("renders column cells without the reserved row metadata", () => {
  const table = q.within(q.table("Team hours"));
  expect(table.columnheader.all().map((cell) => cell.textContent)).toEqual([
    "Contributor",
    "Hours",
    "Notes",
  ]);
  expect(q.within(table.row(/^Ada /)).cell.all()).toHaveLength(3);
  expect(q.within(table.row(/^Grace /)).cell.all()).toHaveLength(3);
  expect(table.rowheader("Total")).toHaveAttribute("scope", "row");
  expect(q.within(table.row(/^Total /)).cell.all()).toHaveLength(2);
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
test("keeps missing hours under their header when adding a contributor", async () => {
  const fixture = q.within(q.article("Table rows"));
  await click(fixture.button("Add contributor"));

  const row = fixture.row(/^Katherine\b/);
  expect(Array.from(row.children, (cell) => cell.textContent)).toEqual([
    "Katherine",
    "",
    "",
  ]);
  expect(row.lastElementChild).toContainElement(
    fixture.textbox("Katherine notes"),
  );
  expect(fixture.textbox("Katherine notes")).toHaveValue("");
});

// Explicit zero must not share an identity with an unkeyed row at index zero.
test("keeps keyed row edits when unkeyed rows change position", async () => {
  const fixture = q.within(q.article("Mixed row keys"));
  await click(fixture.textbox("Assigned task notes"));
  await press.Home();
  await press.End(null, { shiftKey: true });
  await type("Ready to assign");
  await click(fixture.button("Reverse task rows"));

  expect(
    fixture.cell.all(/^(Draft|Assigned) task$/).map((cell) => cell.textContent),
  ).toEqual(["Assigned task", "Draft task"]);
  expect(fixture.textbox("Assigned task notes")).toHaveValue("Ready to assign");
  expect(fixture.textbox("Draft task notes")).toHaveValue("Draft");
});

// A declarative value that is an element other than a TableCell is the cell's
// content. It used to be cloned as the cell itself, which put it in the row
// beside the cells, with the column props on it.
test("renders element values inside the cells of their columns", () => {
  const row = q.within(q.table("Element values")).row(/^Ada /);
  expect(Array.from(row.children, (cell) => cell.tagName)).toEqual([
    "TH",
    "TD",
    "TD",
  ]);
  const cells = q.within(row).cell.all();
  expect(cells.map((cell) => cell.textContent)).toEqual(["Active", "Edit Ada"]);
  expect(cells[1]).toContainElement(q.within(row).button("Edit Ada"));
});
