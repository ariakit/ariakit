import { click, getByRole, hover, press, sleep, type } from "@ariakit/test";

const getSelect = () => getByRole("combobox", { name: "Position" });
const getGrid = () => getByRole("grid", { hidden: true });
const getCell = (name: string) => getByRole("gridcell", { name });

test("default value", async () => {
  expect(getSelect()).toHaveTextContent("Center");
  await click(getSelect());
  expect(getGrid()).toBeVisible();
  expect(getCell("Center")).toHaveFocus();
});

test("change expanded select value with keyboard", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowUp();
  expect(getCell("Top Center")).toHaveFocus();
  await press.ArrowLeft();
  await press.ArrowLeft();
  expect(getCell("Top Left")).toHaveFocus();
  await press.End();
  expect(getCell("Top Right")).toHaveFocus();
  await press.End(null, { ctrlKey: true });
  expect(getCell("Bottom Right")).toHaveFocus();
  await press.Home();
  expect(getCell("Bottom Left")).toHaveFocus();
  await press.Home(null, { ctrlKey: true });
  expect(getCell("Top Left")).toHaveFocus();
  await type("tt");
  expect(getCell("Top Right")).toHaveFocus();
  await press.Escape();
  expect(getGrid()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Center");
  await press.Space();
  await type("top right");
  await press.Enter();
  expect(getSelect()).toHaveTextContent("Top Right");
});

test("change collapsed select value with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(getGrid()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Bottom Center");
  await press.ArrowLeft();
  await press.ArrowLeft();
  expect(getSelect()).toHaveTextContent("Bottom Left");
  await press.ArrowUp();
  expect(getSelect()).toHaveTextContent("Center Left");
  await press.ArrowUp();
  await press.ArrowUp();
  expect(getSelect()).toHaveTextContent("Top Left");
  await type("cc");
  expect(getSelect()).toHaveTextContent("Center");
  await sleep(600);
  await type("bbb");
  expect(getSelect()).toHaveTextContent("Bottom Right");
  await press.Enter();
  expect(getGrid()).toBeVisible();
  expect(getCell("Bottom Right")).toHaveFocus();
});

test("change value on hover", async () => {
  await click(getSelect());
  await hover(getCell("Top Left"));
  expect(getCell("Top Left")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Top Left");
  await hover(getCell("Top Center"));
  expect(getCell("Top Center")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Top Center");
  await hover(document.body);
  expect(getCell("Top Center")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Top Center");
  await click(document.body);
  expect(getGrid()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Top Center");
});

test("keep value on tab", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  await click(getSelect());
  expect(getGrid()).toBeVisible();
  await press.ArrowDown();
  await press.Tab();
  expect(getGrid()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Bottom Center");

  div.remove();
});
