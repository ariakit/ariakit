import { getByRole, hover, press, render } from "ariakit-test";
import Example from ".";

const getToolbar = () => getByRole("toolbar");
const getButton = (name: string) => getByRole("button", { name });

function expectCalls(mock: jest.SpyInstance) {
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

  const log = jest.spyOn(console, "log").mockImplementation(() => {});

  await press.Tab();
  await press.Tab();

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "focus | toolbar | toolbar",
      "focus | item-1 | item-1",
      "focus | toolbar | item-1",
      "keyup | item-1 | item-1",
      "keyup | toolbar | item-1",
      "keydown | item-1 | item-1",
      "keydown | toolbar | item-1",
      "blur | item-1 | item-1",
      "blur | toolbar | item-1",
      "blur | toolbar | toolbar",
    ]
  `);

  await hover(getButton("item-3"));

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "mouseenter | toolbar | item-3",
      "mouseenter | item-3 | item-3",
      "focus | toolbar | toolbar",
      "focus | item-3 | item-3",
      "focus | toolbar | item-3",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).toHaveAttribute("data-focus-visible");
  expect(getButton("item-3")).toHaveAttribute("data-active-item");

  await press.ArrowLeft();

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "keydown | item-3 | item-3",
      "keydown | toolbar | item-3",
      "blur | item-3 | item-3",
      "blur | toolbar | item-3",
      "focus | item-2 | item-2",
      "focus | toolbar | item-2",
      "keyup | item-2 | item-2",
      "keyup | toolbar | item-2",
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
      "blur | item-2 | item-2",
      "blur | toolbar | item-2",
      "mouseenter | item-1 | item-1",
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
      "focus | item-1 | item-1",
      "focus | toolbar | item-1",
      "keydown | item-1 | item-1",
      "keydown | toolbar | item-1",
      "blur | item-1 | item-1",
      "blur | toolbar | item-1",
      "focus | item-2 | item-2",
      "focus | toolbar | item-2",
      "keyup | item-2 | item-2",
      "keyup | toolbar | item-2",
    ]
  `);

  expect(getToolbar()).toHaveAttribute("data-focus-visible");
  expect(getButton("item-1")).not.toHaveAttribute("data-focus-visible");
  expect(getButton("item-1")).not.toHaveAttribute("data-active-item");
  expect(getButton("item-2")).toHaveAttribute("data-focus-visible");
  expect(getButton("item-2")).toHaveAttribute("data-active-item");

  log.mockReset();
});
