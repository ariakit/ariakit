import { press, q } from "@ariakit/test";

test("enter does trigger the alert", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(q.text("Accessible button")).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(1);

  alertMock.mockRestore();
});

test("space doesn't trigger the alert", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

  await press.Tab();
  expect(q.text("Accessible button")).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(0);

  alertMock.mockRestore();
});
