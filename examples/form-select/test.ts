import { click, press, q, type } from "@ariakit/test";

const errors = () => q.text.all("Constraints not satisfied");
const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("click on label", async () => {
  await click(q.text("Favorite fruit"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-focus-visible");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show error on tabbing through select button", async () => {
  await press.ShiftTab();
  await press.ShiftTab();
  expect(q.combobox()).toHaveFocus();
  expect(errors()).toHaveLength(0);
  await press.Tab();
  expect(errors()).toHaveLength(1);
});

test("show error only on blur both the select button and the popover", async () => {
  await click(q.combobox());
  expect(errors()).toHaveLength(0);
  await press.Escape();
  expect(errors()).toHaveLength(0);
  await press.Space();
  await press.ArrowDown();
  await press.Enter();
  expect(errors()).toHaveLength(0);
  await press.Enter();
  await click(q.option("Select an item"));
  expect(errors()).toHaveLength(0);
  await press.Tab();
  expect(errors()).toHaveLength(1);
});

test("submit failed", async () => {
  expect(errors()).toHaveLength(0);
  await press.Tab();
  await type("John");
  await click(q.button("Submit"));
  expect(errors()).toHaveLength(1);
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("submit succeed", async () => {
  await press.Tab();
  await type("John");
  await click(q.combobox());
  await click(q.option("Banana"));
  expect(alert).not.toHaveBeenCalled();
  await press.Enter();
  expect(q.listbox()).toBeVisible();
  expect(alert).not.toHaveBeenCalled();
  await press.Escape();
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(
    JSON.stringify({
      name: "John",
      fruit: "Banana",
    }),
  );
  // Reset on submit
  expect(q.combobox()).toHaveTextContent("Select an item");
});
