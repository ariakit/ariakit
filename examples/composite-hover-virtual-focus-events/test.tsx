import { getByRole, hover, press, render } from "@ariakit/test";
import { SpyInstance } from "vitest";
import Example from "./index.js";

const getToolbar = () => getByRole("toolbar");
const getButton = (name: string) => getByRole("button", { name });

function expectCalls(mock: SpyInstance) {
  const calls = mock.mock.calls.flat();
  mock.mockClear();
  return expect(calls);
}

test("events", async () => {
  render(
    <>
      <Example />
      <button>External button</button>
    </>
  );

  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  await press.Tab();
  await press.Tab();

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: focus | currentTarget: toolbar | target: toolbar",
      "event: focus | currentTarget: item-1 | target: item-1 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-1 | relatedTarget: toolbar",
      "event: keyup | currentTarget: item-1 | target: item-1",
      "event: keyup | currentTarget: toolbar | target: item-1",
      "event: keydown | currentTarget: item-1 | target: item-1",
      "event: keydown | currentTarget: toolbar | target: item-1",
      "event: blur | currentTarget: item-1 | target: item-1",
      "event: blur | currentTarget: toolbar | target: item-1",
      "event: blur | currentTarget: toolbar | target: toolbar",
    ]
  `);

  await hover(getButton("item-3"));

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: mouseenter | currentTarget: toolbar | target: item-3",
      "event: mouseenter | currentTarget: item-3 | target: item-3",
      "event: focus | currentTarget: toolbar | target: toolbar",
      "event: focus | currentTarget: item-3 | target: item-3 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-3 | relatedTarget: toolbar",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).toHaveAttribute("data-active-item");

  await press.ArrowLeft();

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: keydown | currentTarget: item-3 | target: item-3",
      "event: keydown | currentTarget: toolbar | target: item-3",
      "event: blur | currentTarget: item-3 | target: item-3 | relatedTarget: item-2",
      "event: blur | currentTarget: toolbar | target: item-3 | relatedTarget: item-2",
      "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
      "event: keyup | currentTarget: item-2 | target: item-2",
      "event: keyup | currentTarget: toolbar | target: item-2",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).not.toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).not.toHaveAttribute("data-active-item");
  expect(getButton("item-2")).toHaveAttribute("data-focus-visible");
  expect(getButton("item-2")).toHaveAttribute("data-active-item");

  await hover(getButton("item-1"));

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: blur | currentTarget: item-2 | target: item-2 | relatedTarget: item-3",
      "event: blur | currentTarget: toolbar | target: item-2 | relatedTarget: item-3",
      "event: mouseenter | currentTarget: item-1 | target: item-1 | relatedTarget: item-3",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-2")).not.toHaveAttribute("data-focus-visible");
  expect(getButton("item-2")).not.toHaveAttribute("data-active-item");
  expect(getButton("item-1")).not.toHaveAttribute("data-focus-visible");
  expect(getButton("item-1")).toHaveAttribute("data-active-item");

  await press.ArrowRight();

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: focus | currentTarget: item-1 | target: item-1 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-1 | relatedTarget: toolbar",
      "event: keydown | currentTarget: item-1 | target: item-1",
      "event: keydown | currentTarget: toolbar | target: item-1",
      "event: blur | currentTarget: item-1 | target: item-1 | relatedTarget: item-2",
      "event: blur | currentTarget: toolbar | target: item-1 | relatedTarget: item-2",
      "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
      "event: keyup | currentTarget: item-2 | target: item-2",
      "event: keyup | currentTarget: toolbar | target: item-2",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-1")).not.toHaveAttribute("data-focus-visible");
  expect(getButton("item-1")).not.toHaveAttribute("data-active-item");
  expect(getButton("item-2")).toHaveAttribute("data-focus-visible");
  expect(getButton("item-2")).toHaveAttribute("data-active-item");

  log.mockReset();
});
