import {
  click,
  getByRole,
  getByText,
  hover,
  press,
  render,
  type,
} from "ariakit-test";
import Example from ".";

const getMenuButton = () => getByRole("button", { name: "Actions" });
const getMenu = () => getByRole("menu", { hidden: true });
const getMenuItem = (name: string) => getByRole("menuitem", { name });

const spyOnAlert = () =>
  jest.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
});

afterEach(() => {
  alert.mockClear();
});

test("show/hide on click", async () => {
  render(<Example />);
  expect(getMenu()).not.toBeVisible();
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  expect(getMenuItem("Edit")).not.toHaveFocus();
  await click(getMenuButton());
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getMenu()).toBeVisible();
  expect(getMenuItem("Edit")).toHaveFocus();
  expect(getMenuItem("Edit")).toHaveAttribute("data-focus-visible");
  await press.ShiftTab();
  expect(getMenu()).toBeVisible();
  await press.Enter();
  expect(getMenu()).not.toBeVisible();
});

test("show/hide on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getMenu()).toBeVisible();
  expect(getMenuItem("Edit")).toHaveFocus();
  expect(getMenuItem("Edit")).toHaveAttribute("data-focus-visible");
  await press.ShiftTab();
  expect(getMenu()).toBeVisible();
  await press.Space();
  expect(getMenu()).not.toBeVisible();
});

test("show on arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getMenu()).toBeVisible();
  expect(getMenuItem("Edit")).toHaveFocus();
});

test("show on arrow up", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowUp();
  expect(getMenu()).toBeVisible();
  expect(getMenuItem("Report")).toHaveFocus();
});

test("hide on escape", async () => {
  render(<Example />);
  // Click
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
  // Enter
  await press.Enter();
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
  // Space
  await press.Space();
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
  // ArrowDown
  await press.ArrowDown();
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
  // ArrowUp
  await press.ArrowUp();
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("hide on click outside", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  await click(document.body);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("hide on click on outside element", async () => {
  render(
    <>
      <Example />
      <button>Outside</button>
    </>
  );
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  await click(getByText("Outside"));
  expect(getMenu()).not.toBeVisible();
  expect(getByText("Outside")).toHaveFocus();
});

test("hide on tab", async () => {
  render(
    <>
      <Example />
      <button>Outside</button>
    </>
  );
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  await press.Tab();
  expect(getMenu()).not.toBeVisible();
  expect(getByText("Outside")).toHaveFocus();
});

test("tab back to menu button", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  await press.ShiftTab();
  expect(getMenuButton()).toHaveFocus();
  expect(getMenu()).toBeVisible();
  await press.Tab();
  expect(getMenu()).toHaveFocus();
  expect(getMenu()).toBeVisible();
  // Close and open with enter
  await press.ShiftTab();
  await press.Enter();
  await press.Enter();
  await press.ShiftTab();
  await press.Tab();
  expect(getMenuItem("Edit")).not.toHaveFocus();
  expect(getMenu()).toBeVisible();
});

test("navigate through items with keyboard", async () => {
  render(<Example />);
  await click(getMenuButton());
  await press.ArrowDown();
  expect(getMenuItem("Edit")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Share")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Report")).toHaveFocus();
  await press.ArrowLeft();
  expect(getMenuItem("Report")).toHaveFocus();
  await press.Home();
  expect(getMenuItem("Edit")).toHaveFocus();
  await press.ArrowRight();
  expect(getMenuItem("Edit")).toHaveFocus();
  await press.End();
  expect(getMenuItem("Report")).toHaveFocus();
});

test("navigate through items with mouse", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await hover(getMenuItem("Share"));
  expect(getMenuItem("Share")).toHaveAttribute("data-active-item");
  expect(getMenu()).toHaveFocus();
  await hover(getMenuItem("Delete"));
  expect(getMenuItem("Share")).not.toHaveAttribute("data-active-item");
  expect(getMenuItem("Delete")).not.toHaveAttribute("data-active-item");
  expect(getMenu()).toHaveFocus();
});

test("menu item click", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(alert).toHaveBeenCalledTimes(0);
  await click(getMenuItem("Edit"));
  expect(alert).toHaveBeenCalledTimes(1);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("menu item enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("menu item space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("menu item hover enter", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(0);
  await hover(getMenuItem("Edit"));
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("menu item hover space", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(alert).toHaveBeenCalledTimes(0);
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(0);
  await hover(getMenuItem("Edit"));
  await press.Space();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("typeahead", async () => {
  render(<Example />);
  await click(getMenuButton());
  expect(getMenuItem("Edit")).not.toHaveFocus();
  await type("d");
  expect(getMenu()).toHaveFocus();
  await type("re");
  expect(getMenuItem("Report")).toHaveFocus();
});
