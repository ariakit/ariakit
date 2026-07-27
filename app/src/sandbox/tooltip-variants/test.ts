import { click, hover, press, q } from "@ariakit/test";
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
  expect(q.tooltip("Instant tooltip")).not.toBeInTheDocument();
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
  expect(q.tooltip("Bold label")).not.toBeInTheDocument();
});

test("keeps the hover-triggered tooltip mounted during leave", async () => {
  const anchor = q.link("Animated anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Animated tooltip")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip.hidden("Animated tooltip")).toBeVisible();
  await expect.poll(q.tooltip.lazy("Animated tooltip")).not.toBeInTheDocument();
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
  await expect.poll(q.tooltip.lazy("Animated tooltip")).not.toBeInTheDocument();
});

test("Escape from animated tooltip content restores the anchor", async () => {
  const anchor = q.link("Animated anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Animated tooltip")).toBeVisible();
  await click(q.tooltip("Animated tooltip"));
  await press.Escape();
  expect(anchor).toHaveFocus();
  await expect.poll(q.tooltip.lazy("Animated tooltip")).not.toBeInTheDocument();
});
