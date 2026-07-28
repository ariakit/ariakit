import { click, focus, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("shows on hover, hides outside, and immediately reopens", async () => {
  const anchor = q.link("Tooltip anchor");

  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();
  await hover(anchor);
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await hoverOutside();
  await expect.poll(q.tooltip).not.toBeInTheDocument();

  await hover(anchor);
  expect(q.tooltip("Tooltip content")).toBeVisible();
});

test("stays open when hover is followed by keyboard focus", async () => {
  const anchor = q.link("Tooltip anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await focus(anchor);
  await hoverOutside();
  expect(q.tooltip("Tooltip content")).toBeVisible();
});

test("shows on focus and hides after focus moves", async () => {
  await focus(q.link("Tooltip anchor"));
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await press.Tab();
  expect(q.button("After tooltip")).toHaveFocus();
  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();
});

test("stays open after focus-visible and pointer movement", async () => {
  const anchor = q.link("Tooltip anchor");
  await press.Tab();
  expect(anchor).toHaveFocus();
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip("Tooltip content")).toBeVisible();
  await hover(anchor);
  await hoverOutside();
  expect(q.tooltip("Tooltip content")).toBeVisible();
});

test("waits again after keyboard focus is lost", async () => {
  const anchor = q.link("Tooltip anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await press.Tab();
  await press.Tab();
  expect(q.button("After tooltip")).toHaveFocus();
  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();

  await hoverOutside();
  await hover(anchor);
  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
});

test("Escape from tooltip content restores its anchor", async () => {
  const anchor = q.link("Tooltip anchor");
  await hover(anchor);
  expect(await q.tooltip.wait("Tooltip content")).toBeVisible();
  await click(q.tooltip("Tooltip content"));

  await press.Escape();
  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();
  expect(anchor).toHaveFocus();
});
