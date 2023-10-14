import { click, q } from "@ariakit/test";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("default value", () => {
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("submit form", async () => {
  expect(alert).not.toHaveBeenCalled();
  await click(q.button("Submit"));
  expect(alert).toHaveBeenCalledWith("Apple");
});

test("select another value", async () => {
  await click(q.combobox());
  await click(q.option("Orange"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveTextContent("Orange");
  await click(q.button("Submit"));
  expect(alert).toHaveBeenCalledWith("Orange");
});
