import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import type { TableRow } from "./table.react.tsx";
import { Table } from "./table.react.tsx";

function getRowTexts(row: HTMLElement) {
  return Array.from(row.children).map((cell) => cell.textContent);
}

// Regression coverage: iterating each row's own entries once rendered sparse
// rows with fewer cells and followed the row's key insertion order, shifting
// data under the wrong headers.
test("aligns sparse and reordered rows to the head columns", async () => {
  const { unmount } = await render(
    <Table
      rows={[
        { group: "head", name: "Name", age: "Age" },
        { age: "37", name: "Ada" },
        { name: "Grace", age: null },
      ]}
    />,
  );
  const [headRow, ...bodyRows] = q.row.all();
  expect(headRow && getRowTexts(headRow)).toEqual(["Name", "Age"]);
  expect(bodyRows.map(getRowTexts)).toEqual([
    ["Ada", "37"],
    ["Grace", ""],
  ]);
  unmount();
});

test("ignores inherited row properties", async () => {
  const row: TableRow<"name" | "age"> = Object.create({ age: "99" });
  row.name = "Ada";
  const { unmount } = await render(
    <Table rows={[{ group: "head", name: "Name", age: "Age" }, row]} />,
  );
  const [, bodyRow] = q.row.all();
  expect(bodyRow && getRowTexts(bodyRow)).toEqual(["Ada", ""]);
  unmount();
});

test("renders columns that only appear in body rows", async () => {
  await render(
    <Table
      rows={[
        { group: "head", name: "Name" },
        { name: "Ada", note: "First" },
      ]}
    />,
  );
  const [headRow, bodyRow] = q.row.all();
  expect(headRow && getRowTexts(headRow)).toEqual(["Name", ""]);
  expect(bodyRow && getRowTexts(bodyRow)).toEqual(["Ada", "First"]);
});
