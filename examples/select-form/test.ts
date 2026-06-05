import { expect, test, vi, click, q } from "../../browser-test-utils.ts";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

test("default value", () => {
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("submit form", async () => {
  using alert = spyOnAlert();
  expect(alert).not.toHaveBeenCalled();
  await click(q.button("Submit"));
  expect(alert).toHaveBeenCalledWith("Apple");
});

test("select another value", async () => {
  using alert = spyOnAlert();
  await click(q.combobox());
  await click(q.option("Orange"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveTextContent("Orange");
  await click(q.button("Submit"));
  expect(alert).toHaveBeenCalledWith("Orange");
});
