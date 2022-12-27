import { getByText, press, render } from "@ariakit/test";
import { axe } from "jest-axe";
import Example from ".";

const getCommand = () => getByText("Button");

test("a11y", async () => {
  render(<Example />);
  expect(await axe(getCommand())).toHaveNoViolations();
});

test("markup", () => {
  render(<Example />);
  expect(getCommand()).toMatchInlineSnapshot(`
    <div
      class="button"
      data-command=""
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});

test("tab", async () => {
  render(<Example />);
  expect(getCommand()).not.toHaveFocus();
  await press.Tab();
  expect(getCommand()).toHaveFocus();
});

test("enter", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();
  render(<Example />);
  await press.Tab();
  expect(getCommand()).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(1);
  alertMock.mockRestore();
});

test("space", async () => {
  const alertMock = jest.spyOn(window, "alert").mockImplementation();
  render(<Example />);
  await press.Tab();
  expect(getCommand()).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);
  alertMock.mockRestore();
});
