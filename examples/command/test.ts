import { getByText, press } from "@ariakit/test";

const getCommand = () => getByText("Button");

test("markup", () => {
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
  expect(getCommand()).not.toHaveFocus();
  await press.Tab();
  expect(getCommand()).toHaveFocus();
});

test("enter", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
  await press.Tab();
  expect(getCommand()).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(1);
  alertMock.mockRestore();
});

test("space", async () => {
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
  await press.Tab();
  expect(getCommand()).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);
  alertMock.mockRestore();
});
