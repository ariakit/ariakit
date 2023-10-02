import { click, hover, press, q, sleep, type } from "@ariakit/test";

test("default value", async () => {
  expect(q.combobox("Position")).toHaveTextContent("Center");
  await click(q.combobox("Position"));
  expect(q.grid()).toBeVisible();
  expect(q.gridcell("Center")).toHaveFocus();
});

test("change expanded select value with keyboard", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowUp();
  expect(q.gridcell("Top Center")).toHaveFocus();
  await press.ArrowLeft();
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

test("change collapsed select value with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Center");
  await press.ArrowLeft();
  await press.ArrowLeft();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Left");
  await press.ArrowUp();
  expect(q.combobox("Position")).toHaveTextContent("Center Left");
  await press.ArrowUp();
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

test("change value on hover", async () => {
  await click(q.combobox("Position"));
  await hover(q.gridcell("Top Left"));
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(q.combobox("Position")).toHaveTextContent("Top Left");
  await hover(q.gridcell("Top Center"));
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(q.combobox("Position")).toHaveTextContent("Top Center");
  await hover(document.body);
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(q.combobox("Position")).toHaveTextContent("Top Center");
  await click(document.body);
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Top Center");
});

test("keep value on tab", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  await click(q.combobox("Position"));
  expect(q.grid()).toBeVisible();
  await press.ArrowDown();
  await press.Tab();
  expect(q.grid()).not.toBeInTheDocument();
  expect(q.combobox("Position")).toHaveTextContent("Bottom Center");

  div.remove();
});
