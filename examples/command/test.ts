import { press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <div
      class="button"
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});

test("tab", async () => {
  expect(q.button()).not.toHaveFocus();
  await press.Tab();
  expect(q.button()).toHaveFocus();
});

test("enter", async () => {
  using alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
  await press.Tab();
  expect(q.button()).toHaveFocus();
  await press.Enter();
  expect(alertMock).toHaveBeenCalledTimes(1);
});

test("space", async () => {
  using alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
  await press.Tab();
  expect(q.button()).toHaveFocus();
  await press.Space();
  expect(alertMock).toHaveBeenCalledTimes(1);
});
