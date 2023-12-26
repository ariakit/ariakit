import { click, press, q } from "@ariakit/test";
import type { MockInstance } from "vitest";

function expectCalls(mock: MockInstance) {
  const calls = mock.mock.calls.flat();
  mock.mockClear();
  return expect(calls);
}

test("events", async () => {
  const externalButton = document.createElement("button");
  externalButton.textContent = "External button";
  document.body.append(externalButton);

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

  await click(q.button("item-3"));

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: focus | currentTarget: item-3 | target: item-3",
      "event: focus | currentTarget: toolbar | target: toolbar | relatedTarget: item-3",
      "event: focus | currentTarget: toolbar | target: item-3",
    ]
  `);

  await click(q.button("item-2"));

  expectCalls(log).toMatchInlineSnapshot(`
    [
      "event: blur | currentTarget: item-3 | target: item-3 | relatedTarget: item-2",
      "event: blur | currentTarget: toolbar | target: item-3 | relatedTarget: item-2",
      "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
      "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
    ]
  `);

  log.mockReset();

  externalButton.remove();
});
