import { click, hover, press, q } from "@ariakit/test";
import { version } from "react";
import type { MockInstance } from "vitest";

function expectCalls(mock: MockInstance) {
  const calls = mock.mock.calls.flat();
  mock.mockClear();
  return expect(calls);
}

const log = vi.spyOn(console, "log").mockImplementation(() => {});

beforeEach(() => {
  const externalButton = document.createElement("button");
  externalButton.textContent = "External button";
  document.body.append(externalButton);

  return () => {
    log.mockClear();
    externalButton.remove();
  };
});

test.skipIf(version.startsWith("17") && process.env.ARIAKIT_BENCH === "1")(
  "events",
  async () => {
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

    await hover(q.button("item-3"));

    expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: mouseenter | currentTarget: toolbar | target: item-3",
      "event: mouseenter | currentTarget: item-3 | target: item-3",
      "event: focus | currentTarget: toolbar | target: toolbar",
      "event: focus | currentTarget: item-3 | target: item-3 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-3 | relatedTarget: toolbar",
    ]
  `);

    expect(q.toolbar()).toHaveAttribute("data-focus-visible");
    expect(q.button("item-3")).toHaveAttribute("data-focus-visible");
    expect(q.button("item-3")).toHaveAttribute("data-active-item");

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

    expect(q.toolbar()).toHaveAttribute("data-focus-visible");
    expect(q.button("item-3")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-3")).not.toHaveAttribute("data-active-item");
    expect(q.button("item-2")).toHaveAttribute("data-focus-visible");
    expect(q.button("item-2")).toHaveAttribute("data-active-item");

    await hover(q.button("item-1"));

    expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: blur | currentTarget: item-2 | target: item-2 | relatedTarget: item-3",
      "event: blur | currentTarget: toolbar | target: item-2 | relatedTarget: item-3",
      "event: mouseenter | currentTarget: item-1 | target: item-1 | relatedTarget: item-3",
    ]
  `);

    expect(q.toolbar()).toHaveAttribute("data-focus-visible");
    expect(q.button("item-2")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-2")).not.toHaveAttribute("data-active-item");
    expect(q.button("item-1")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-1")).toHaveAttribute("data-active-item");

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

    expect(q.toolbar()).toHaveAttribute("data-focus-visible");
    expect(q.button("item-1")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-1")).not.toHaveAttribute("data-active-item");
    expect(q.button("item-2")).toHaveAttribute("data-focus-visible");
    expect(q.button("item-2")).toHaveAttribute("data-active-item");

    await click(q.button("item-1"));

    expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: blur | currentTarget: item-2 | target: item-2 | relatedTarget: item-1",
      "event: blur | currentTarget: toolbar | target: item-2 | relatedTarget: item-1",
      "event: focus | currentTarget: item-1 | target: item-1 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-1 | relatedTarget: toolbar",
    ]
  `);

    expect(q.toolbar()).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-1")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-1")).toHaveAttribute("data-active-item");
    expect(q.button("item-2")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("item-2")).not.toHaveAttribute("data-active-item");
  },
);
