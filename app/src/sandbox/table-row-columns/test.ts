import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps null and reordered row cells aligned", () => {
  const table = q.table.ensure();
  const rows = q.within(table).row.ensure.all();
  expect(rows).toHaveLength(3);

  const [, firstRow, secondRow] = rows;
  if (!firstRow) throw new Error("Expected first body row");
  if (!secondRow) throw new Error("Expected second body row");

  const firstRowCells = q.within(firstRow).cell.ensure.all();
  const secondRowCells = q.within(secondRow).cell.ensure.all();

  expect(firstRowCells).toHaveLength(3);
  expect(firstRowCells.map((cell) => cell.textContent)).toEqual([
    "Ada",
    "",
    "London",
  ]);
  expect(secondRowCells.map((cell) => cell.textContent)).toEqual([
    "Grace",
    "38",
    "Paris",
  ]);
});
