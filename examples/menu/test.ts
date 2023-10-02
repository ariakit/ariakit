import { click, hover, press, q, type } from "@ariakit/test";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("show/hide on click", async () => {
  expect(q.menu()).not.toBeInTheDocument();
  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  expect(q.menuitem("Edit")).not.toHaveFocus();
  await click(q.button("Actions"));
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("show/hide on enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  expect(q.menuitem("Edit")).toHaveAttribute("data-focus-visible");
  await press.ShiftTab();
  expect(q.menu()).toBeVisible();
  await press.Enter();
  expect(q.menu()).not.toBeInTheDocument();
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  expect(q.menuitem("Edit")).toHaveAttribute("data-focus-visible");
  await press.ShiftTab();
  expect(q.menu()).toBeVisible();
  await press.Space();
  expect(q.menu()).not.toBeInTheDocument();
});

test("show on arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
});

test("show on arrow up", async () => {
  await press.Tab();
  await press.ArrowUp();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Report")).toHaveFocus();
});

test("hide on escape", async () => {
  // Click
  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
  // Enter
  await press.Enter();
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
  // Space
  await press.Space();
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
  // ArrowDown
  await press.ArrowDown();
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
  // ArrowUp
  await press.ArrowUp();
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  await click(document.body);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("hide on click on outside element", async () => {
  const buttonOutside = document.createElement("button");
  buttonOutside.textContent = "Outside";
  document.body.append(buttonOutside);

  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  await click(q.text("Outside"));
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.text("Outside")).toHaveFocus();

  buttonOutside.remove();
});

test("hide on tab", async () => {
  const buttonOutside = document.createElement("button");
  buttonOutside.textContent = "Outside";
  document.body.append(buttonOutside);

  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  await press.Tab();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.text("Outside")).toHaveFocus();

  buttonOutside.remove();
});

test("tab back to menu button", async () => {
  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  await press.ShiftTab();
  expect(q.button("Actions")).toHaveFocus();
  expect(q.menu()).toBeVisible();
  await press.Tab();
  expect(q.menu()).toHaveFocus();
  expect(q.menu()).toBeVisible();
  // Close and open with enter
  await press.ShiftTab();
  await press.Enter();
  await press.Enter();
  await press.ShiftTab();
  await press.Tab();
  expect(q.menuitem("Edit")).not.toHaveFocus();
  expect(q.menu()).toBeVisible();
});

test("navigate through items with keyboard", async () => {
  await click(q.button("Actions"));
  await press.ArrowDown();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Share")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Report")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.menuitem("Report")).toHaveFocus();
  await press.Home();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.End();
  expect(q.menuitem("Report")).toHaveFocus();
});

test("navigate through items with mouse", async () => {
  await press.Tab();
  await press.Enter();
  await hover(q.menuitem("Share"));
  expect(q.menuitem("Share")).toHaveAttribute("data-active-item");
  expect(q.menu()).toHaveFocus();
  await hover(q.menuitem("Delete"));
  expect(q.menuitem("Share")).not.toHaveAttribute("data-active-item");
  expect(q.menuitem("Delete")).not.toHaveAttribute("data-active-item");
  expect(q.menu()).toHaveFocus();
});

test("menu item click", async () => {
  await click(q.button("Actions"));
  expect(alert).toHaveBeenCalledTimes(0);
  await click(q.menuitem("Edit"));
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("menu item enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("menu item space", async () => {
  await press.Tab();
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("menu item hover enter", async () => {
  await click(q.button("Actions"));
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(0);
  await hover(q.menuitem("Edit"));
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("menu item hover space", async () => {
  await click(q.button("Actions"));
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(0);
  await hover(q.menuitem("Edit"));
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("typeahead", async () => {
  await click(q.button("Actions"));
  expect(q.menuitem("Edit")).not.toHaveFocus();
  await type("d");
  expect(q.menu()).toHaveFocus();
  await type("re");
  expect(q.menuitem("Report")).toHaveFocus();
});
