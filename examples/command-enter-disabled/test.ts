import { expect, test, vi, press, q } from "../../browser-test-utils.ts";

test("enter doesn't trigger the alert", async () => {
  using alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(q.text("Accessible button")).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(0);
});

test("space does trigger the alert", async () => {
  using alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(q.text("Accessible button")).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);
});
