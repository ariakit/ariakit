import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("maps cell range endpoints to selectable rows", async () => {
  expect(q.grid("Launch portfolio")).toHaveAttribute(
    "aria-multiselectable",
    "true",
  );

  await click(q.gridcell("Atlas owner"));
  await click(q.gridcell("Lumen status"), { shiftKey: true });

  for (const name of ["Atlas", "Beacon", "Lumen"]) {
    expect(q.row(`${name} project`)).toHaveAttribute("aria-selected", "true");
    expect(q.row(`${name} project`)).toHaveAttribute("data-selected");
  }
  expect(q.row("Nova project")).toHaveAttribute("aria-selected", "false");
  expect(q.gridcell("Atlas owner")).not.toHaveAttribute("aria-selected");
  expect(q.gridcell("Lumen status")).not.toHaveAttribute("data-selected");
  expect(q.status("Grid selection")).toHaveTextContent(
    "3 selected: Atlas, Beacon, Lumen",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("extends one row horizontally and several rows vertically", async () => {
  await click(q.button("Clear projects"));
  await click(q.gridcell("Beacon owner"));

  await press.ArrowRight(undefined, { shiftKey: true });
  expect(q.gridcell("Beacon status")).toHaveFocus();
  expect(q.status("Grid selection")).toHaveTextContent("1 selected: Beacon");

  await press.ArrowDown(undefined, { shiftKey: true });
  expect(q.gridcell("Lumen status")).toHaveFocus();
  expect(q.row("Beacon project")).toHaveAttribute("aria-selected", "true");
  expect(q.row("Lumen project")).toHaveAttribute("aria-selected", "true");
  expect(q.status("Grid selection")).toHaveTextContent(
    "2 selected: Beacon, Lumen",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("selects rows, never cells, with the store command", async () => {
  await click(q.button("Select every project"));
  expect(q.status("Grid selection")).toHaveTextContent(
    "6 selected: Atlas, Beacon, Lumen, Nova, Orbit, Prism",
  );

  for (const name of ["Atlas", "Beacon", "Lumen", "Nova", "Orbit", "Prism"]) {
    expect(q.row(`${name} project`)).toHaveAttribute("aria-selected", "true");
  }
  expect(q.gridcell("Prism name")).not.toHaveAttribute("aria-selected");
  expect(q.gridcell("Prism updated")).not.toHaveAttribute("data-selected");
});
