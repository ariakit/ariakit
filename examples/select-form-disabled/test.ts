import { click, press, q } from "@ariakit/test";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("disabled select is visually and semantically disabled", () => {
  const button = q.combobox();
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).toHaveStyle("pointer-events: none");
});

test("disabled select cannot be opened with click", async () => {
  await click(q.combobox());
  expect(q.listbox()).not.toBeInTheDocument();
});

test("disabled select cannot be opened with keyboard", async () => {
  await press.Tab();
  await press.ShiftTab();

  expect(q.button("Submit")).toHaveFocus();

  await press.ArrowDown();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("disabled select does not submit value", async () => {
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(null);
});
