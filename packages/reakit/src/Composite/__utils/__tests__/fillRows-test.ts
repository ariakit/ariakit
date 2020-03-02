import { fillRows } from "../fillRows";
import { Item } from "../types";

test("fillRows", () => {
  const rows: Item[][] = [
    [
      { id: "0", ref: { current: null }, rowId: "0" },
      { id: "1", ref: { current: null }, rowId: "0" }
    ],
    [{ id: "0", ref: { current: null }, rowId: "1" }],
    [{ id: "0", ref: { current: null }, rowId: "2" }]
  ];
  expect(fillRows(rows)).toEqual([
    [rows[0][0], rows[0][1]],
    [
      rows[1][0],
      {
        id: "__EMPTY_ITEM__",
        ref: { current: null },
        disabled: true,
        rowId: "1"
      }
    ],
    [
      rows[2][0],
      {
        id: "__EMPTY_ITEM__",
        ref: { current: null },
        disabled: true,
        rowId: "2"
      }
    ]
  ]);
});
