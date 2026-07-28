import { click, hover, press, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-grid/test.ts
test("uses the center as the default value", async () => {
  expect(q.combobox("Position")).toHaveTextContent("Center");
  await click(q.combobox("Position"));
  expect(q.grid()).toBeVisible();
  expect(q.gridcell("Center")).toHaveFocus();
});

// examples/select-grid/test.ts
test("changes an expanded value with the keyboard", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowUp();
  expect(q.gridcell("Top Center")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.gridcell("Top Left")).toHaveFocus();
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.End(null, { ctrlKey: true });
  expect(q.gridcell("Bottom Right")).toHaveFocus();
  await press.Home();
  expect(q.gridcell("Bottom Left")).toHaveFocus();
  await press.Home(null, { ctrlKey: true });
  expect(q.gridcell("Top Left")).toHaveFocus();
  await type("tt");
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.Escape();
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Center");
  await press.Space();
  await type("top right");
  await press.Enter();
  expect(q.combobox("Position")).toHaveTextContent("Top Right");
});

// examples/select-grid/test.ts
test("changes a collapsed value with the keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Center");
  await press.ArrowLeft();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Left");
  await press.ArrowUp();
  expect(q.combobox("Position")).toHaveTextContent("Center Left");
  await press.ArrowUp();
  expect(q.combobox("Position")).toHaveTextContent("Top Left");
  await type("cc");
  expect(q.combobox("Position")).toHaveTextContent("Center");
  await sleep(600);
  await type("bbb");
  expect(q.combobox("Position")).toHaveTextContent("Bottom Right");
  await press.Enter();
  expect(q.grid()).toBeVisible();
  expect(q.gridcell("Bottom Right")).toHaveFocus();
});

// examples/select-grid/test.ts
test("changes the value on hover", async () => {
  await click(q.combobox("Position"));
  await hover(q.gridcell("Top Left"));
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(q.combobox("Position")).toHaveTextContent("Top Left");
  await hover(q.gridcell("Top Center"));
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(q.combobox("Position")).toHaveTextContent("Top Center");
  await hover(document.body);
  expect(q.gridcell("Top Center")).toHaveFocus();
  await click(document.body);
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Top Center");
});

// examples/select-grid/test.ts
test("keeps the moved value when tabbing out", async () => {
  const target = document.createElement("div");
  target.tabIndex = 0;
  document.body.append(target);

  await click(q.combobox("Position"));
  await press.ArrowDown();
  await press.Tab();
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Center");

  target.remove();
});
