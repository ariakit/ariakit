import { getByText, press } from "@ariakit/test";

test("enter doesn't trigger the alert", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(0);

  alertMock.mockRestore();
});

test("space does trigger the alert", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);

  alertMock.mockRestore();
});
