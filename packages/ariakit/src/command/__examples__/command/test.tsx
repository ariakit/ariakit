import { getByText, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

test("a11y", async () => {
  render(<Example />);
  expect(await axe(getByText("Accessible button"))).toHaveNoViolations();
});

test("markup", () => {
  render(<Example />);
  expect(getByText("Accessible button")).toMatchInlineSnapshot(`
    <div
      class="button"
      data-command=""
      tabindex="0"
    >
      Accessible button
    </div>
  `);
});

test("tab", async () => {
  render(<Example />);
  expect(getByText("Accessible button")).not.toHaveFocus();
  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
});

test("enter", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();

  render(<Example />);
  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(1);

  alertMock.mockRestore();
});

test("space", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();

  render(<Example />);
  await press.Tab();
  expect(getByText("Accessible button")).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);

  alertMock.mockRestore();
});
