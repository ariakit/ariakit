import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function events() {
  return q
    .within(q.list("Event log"))
    .listitem.all()
    .map((item) => item.textContent);
}

test("dispatches virtual focus events in order", async () => {
  await press.Tab();
  await press.Tab();
  expect(events()).toEqual([
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
  ]);

  await click(q.button("item-3"));
  expect(events().slice(10)).toEqual([
    "event: focus | currentTarget: item-3 | target: item-3",
    "event: focus | currentTarget: toolbar | target: toolbar | relatedTarget: item-3",
    "event: focus | currentTarget: toolbar | target: item-3",
  ]);

  await click(q.button("item-2"));
  expect(events().slice(13)).toEqual([
    "event: blur | currentTarget: item-3 | target: item-3 | relatedTarget: item-2",
    "event: blur | currentTarget: toolbar | target: item-3 | relatedTarget: item-2",
    "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
    "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
  ]);
});

test("dispatches blur on an unregistered item", async () => {
  await press.Tab();
  await click(q.button("unregistered item"));
  await click(q.button("External button"));

  expect(
    events().filter((event) =>
      event.includes("currentTarget: item-unregistered"),
    ),
  ).toEqual([
    "event: focus | currentTarget: item-unregistered | target: item-unregistered | relatedTarget: toolbar",
    "event: blur | currentTarget: item-unregistered | target: item-unregistered | relatedTarget: toolbar",
  ]);
});
