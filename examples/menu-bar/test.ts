import { click, hover, press, q, sleep, type } from "@ariakit/test";

test("show/hide on click", async () => {
  expect(q.menu("File")).not.toBeInTheDocument();
  await click(q.menuitem("File"));
  expect(q.menu("File")).toBeVisible();
  expect(q.menu("File")).toHaveFocus();
  expect(q.menuitem("New Tab")).not.toHaveFocus();
  await click(q.menuitem("New Tab"));
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await click(q.menuitem("File"));
  await click(q.menuitem("File"));
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New Tab")).toHaveFocus();
  await press.Enter();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Enter();
  await press.ShiftTab();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Enter();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New Tab")).toHaveFocus();
  await press.Space();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Space();
  await press.ShiftTab();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("File")).toHaveFocus();
  await press.Space();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menuitem("File")).toHaveFocus();
});

test("show/hide on key down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.menu("File")).toBeVisible();
  expect(q.menuitem("New Tab")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menu("Edit")).toBeInTheDocument();
  expect(q.menu("Edit")).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ArrowUp();
  expect(q.menuitem("Emoji & Symbols")).toHaveFocus();
  await press.ArrowLeft();
  await press.ArrowRight();
  await press.ArrowUp();
  expect(q.menuitem("Emoji & Symbols")).toHaveFocus();
  await type("f");
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(q.menu("Find")).toBeInTheDocument();
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Search the Web")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.menuitem("View")).toHaveFocus();
  expect(q.menu("View")).toBeInTheDocument();
  expect(q.menu("View")).toBeVisible();
  await press.ArrowDown();
  expect(q.menuitem("Force Reload This Page")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menuitem("File")).toHaveFocus();
  expect(q.menu("File")).toBeVisible();
});

test("show/hide on hover", async () => {
  await hover(q.menuitem("File"));
  expect(q.menu("File")).not.toBeInTheDocument();
  await click(q.menuitem("File"));
  expect(q.menu("File")).toBeVisible();
  await hover(q.menuitem("New Window"));
  expect(q.menu("File")).toHaveFocus();
  await hover(q.menuitem("View"));
  expect(q.menuitem("View")).toHaveFocus();
  expect(q.menu("File")).not.toBeInTheDocument();
  expect(q.menu("View")).toBeInTheDocument();
  expect(q.menu("View")).toBeVisible();
});

test("hide on escape", async () => {
  await press.Tab();
  await press.Enter();
  await type("sh");
  expect(q.menuitem("Share")).toHaveFocus();
  await sleep(600);
  await press.Space();
  expect(q.menuitem("Email Link")).toHaveFocus();
  await press.Escape();
  expect(q.menuitem("File")).toHaveFocus();
  expect(q.menu("Share")).not.toBeInTheDocument();
  expect(q.menu("File")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(q.menuitem("Edit")).toHaveFocus();
  expect(q.menu("Edit")).not.toBeInTheDocument();
});
