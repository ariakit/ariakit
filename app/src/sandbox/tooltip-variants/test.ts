import { click, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

async function hoverOutside() {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
}

test("shows the instant tooltip on hover and focus", async () => {
  const anchor = q.button("Instant anchor");
  await hover(anchor);
  expect(q.tooltip("Instant tooltip")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip.maybe("Instant tooltip")).not.toBeInTheDocument();
  await press.Tab();
  expect(anchor).toHaveFocus();
  expect(q.tooltip("Instant tooltip")).toBeVisible();
});

test("keeps the label tooltip open when its anchor is clicked", async () => {
  const anchor = q.button("Bold");
  await hover(anchor);
  expect(await q.tooltip.wait("Bold label")).toBeVisible();
  await click(anchor);
  expect(q.tooltip("Bold label")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip.maybe("Bold label")).not.toBeInTheDocument();
});

test("hideOnClick hides the tooltip until the pointer leaves the anchor", async () => {
  const anchor = q.button("Italic");
  await hover(anchor);
  expect(await q.tooltip.wait("Italic label")).toBeVisible();
  await click(anchor);
  expect(q.tooltip.maybe("Italic label")).not.toBeInTheDocument();
  await hover(anchor);
  // The tooltip would show after its 20ms timeout, and no state shows that the
  // timeout passed without it.
  await sleep(50);
  expect(q.tooltip.maybe("Italic label")).not.toBeInTheDocument();
  await hoverOutside();
  await hover(anchor);
  expect(await q.tooltip.wait("Italic label")).toBeVisible();
});

test("keeps the hover-triggered tooltip mounted during leave", async () => {
  const anchor = q.link("Animated anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Animated tooltip")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip.hidden("Animated tooltip")).toBeVisible();
  await expect
    .poll(q.tooltip.maybe.lazy("Animated tooltip"))
    .not.toBeInTheDocument();
});

test("keeps the focus-triggered tooltip mounted during leave", async () => {
  const anchor = q.link("Animated anchor");
  await press.Tab();
  await press.Tab();
  await press.Tab();
  expect(anchor).toHaveFocus();
  expect(q.tooltip("Animated tooltip")).toBeVisible();
  await click(q.button("Bold"));
  expect(q.tooltip.hidden("Animated tooltip")).toBeVisible();
  await expect
    .poll(q.tooltip.maybe.lazy("Animated tooltip"))
    .not.toBeInTheDocument();
});

test("Escape from animated tooltip content restores the anchor", async () => {
  const anchor = q.link("Animated anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Animated tooltip")).toBeVisible();
  await click(q.tooltip("Animated tooltip"));
  await press.Escape();
  expect(anchor).toHaveFocus();
  await expect
    .poll(q.tooltip.maybe.lazy("Animated tooltip"))
    .not.toBeInTheDocument();
});
