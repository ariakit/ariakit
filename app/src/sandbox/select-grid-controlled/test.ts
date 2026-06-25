import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("closed grid select with controlled items navigates between cells", async () => {
  // The controlled public items omit rowId (it comes from rendered SelectRow
  // registration), so the public collection state cannot describe the grid...
  expect(q.status.ensure("Grid state rowId")).toHaveTextContent("missing");
  // ...but the rendered registration metadata does, surfaced through item().
  expect(q.status.ensure("Grid lookup rowId")).not.toHaveTextContent("missing");

  await press.Tab();
  expect(q.combobox.ensure("Grid fruit")).toHaveFocus();
  expect(q.status.ensure("Grid value")).toHaveTextContent("None");

  // The default select orientation is vertical, so horizontal movement on the
  // closed select only works when it recognizes the grid. ArrowRight must reach
  // the first cell and then advance across the row.
  await press.ArrowRight();
  expect(q.status.ensure("Grid value")).toHaveTextContent("Top Left");

  await press.ArrowRight();
  expect(q.status.ensure("Grid value")).toHaveTextContent("Top Center");

  // ArrowLeft is gated on the same grid detection, so it must move back.
  await press.ArrowLeft();
  expect(q.status.ensure("Grid value")).toHaveTextContent("Top Left");
});
