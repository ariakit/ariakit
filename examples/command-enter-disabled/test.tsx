import { getByText, press, render } from "@ariakit/test";
import Example from "./index.jsx";

test("enter doesn't trigger the alert", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();

  render(<Example />);
  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(0);

  alertMock.mockRestore();
});

test("space does trigger the alert", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();

  render(<Example />);
  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);

  alertMock.mockRestore();
});
