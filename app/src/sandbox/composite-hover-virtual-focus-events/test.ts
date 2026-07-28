import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function events() {
  return q
    .within(q.list("Event log"))
    .listitem.all()
    .map((item) => item.textContent);
}

test("dispatches hover and virtual focus events in order", async () => {
  await press.Tab();
  await press.Tab();
  expect(events()).toHaveLength(10);

  await hover(q.button("item-3"));
  expect(events().slice(10)).toEqual([
    "event: mouseenter | currentTarget: toolbar | target: item-3",
    "event: mouseenter | currentTarget: item-3 | target: item-3",
    "event: focus | currentTarget: toolbar | target: toolbar",
    "event: focus | currentTarget: item-3 | target: item-3 | relatedTarget: toolbar",
    "event: focus | currentTarget: toolbar | target: item-3 | relatedTarget: toolbar",
  ]);
  expect(q.toolbar()).toHaveAttribute("data-focus-visible");
  expect(q.button("item-3")).toHaveAttribute("data-focus-visible");
  expect(q.button("item-3")).toHaveAttribute("data-active-item");

  await press.ArrowLeft();
  expect(events().slice(15)).toEqual([
    "event: keydown | currentTarget: item-3 | target: item-3",
    "event: keydown | currentTarget: toolbar | target: item-3",
    "event: blur | currentTarget: item-3 | target: item-3 | relatedTarget: item-2",
    "event: blur | currentTarget: toolbar | target: item-3 | relatedTarget: item-2",
    "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
    "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
    "event: keyup | currentTarget: item-2 | target: item-2",
    "event: keyup | currentTarget: toolbar | target: item-2",
  ]);
  expect(q.button("item-3")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-3")).not.toHaveAttribute("data-active-item");
  expect(q.button("item-2")).toHaveAttribute("data-focus-visible");
  expect(q.button("item-2")).toHaveAttribute("data-active-item");

  await hover(q.button("item-1"));
  expect(events().slice(23)).toEqual([
    "event: blur | currentTarget: item-2 | target: item-2 | relatedTarget: item-3",
    "event: blur | currentTarget: toolbar | target: item-2 | relatedTarget: item-3",
    "event: mouseenter | currentTarget: item-1 | target: item-1 | relatedTarget: item-3",
  ]);
  expect(q.button("item-2")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-2")).not.toHaveAttribute("data-active-item");
  expect(q.button("item-1")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-1")).toHaveAttribute("data-active-item");

  await press.ArrowRight();
  expect(events().slice(26)).toEqual([
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
  ]);
  expect(q.button("item-1")).not.toHaveAttribute("data-active-item");
  expect(q.button("item-2")).toHaveAttribute("data-focus-visible");
  expect(q.button("item-2")).toHaveAttribute("data-active-item");

  await click(q.button("item-1"));
  expect(events().slice(36)).toEqual([
    "event: blur | currentTarget: item-2 | target: item-2 | relatedTarget: item-1",
    "event: blur | currentTarget: toolbar | target: item-2 | relatedTarget: item-1",
    "event: focus | currentTarget: item-1 | target: item-1 | relatedTarget: toolbar",
    "event: focus | currentTarget: toolbar | target: item-1 | relatedTarget: toolbar",
  ]);
  expect(q.toolbar()).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-1")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-1")).toHaveAttribute("data-active-item");
  expect(q.button("item-2")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("item-2")).not.toHaveAttribute("data-active-item");
});
