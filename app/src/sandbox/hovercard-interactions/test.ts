import { click, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

const hovercard = () => q.dialog("Ariakit profile");

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

// https://github.com/ariakit/ariakit/issues/7043
test("shows after hovering and hides after hovering outside", async () => {
  expect(hovercard()).not.toBeInTheDocument();

  await hover(q.link("@ariakit.com"));
  expect(hovercard()).not.toBeInTheDocument();
  await expect.poll(hovercard).toBeVisible();

  await hoverOutside();
  expect(hovercard()).toBeVisible();
  await expect.poll(hovercard).not.toBeInTheDocument();
});

test("stays open while focused", async () => {
  await hover(q.link("@ariakit.com"));
  await expect.poll(hovercard).toBeVisible();
  await click(q.button("Follow"));

  await hoverOutside();
  await sleep(300);
  expect(hovercard()).toBeVisible();
});

test("stays open when the pointer quickly returns", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await hoverOutside();
  await sleep(100);
  await hover(anchor);
  await sleep(300);
  expect(hovercard()).toBeVisible();

  await hoverOutside();
  await sleep(100);
  await hover(q.button("Follow"));
  await sleep(300);
  expect(hovercard()).toBeVisible();
});

test("Escape closes an unfocused hovercard without moving focus", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await press.Escape();
  expect(hovercard()).not.toBeInTheDocument();
  expect(anchor).not.toHaveFocus();
});

test("Escape closes a focused hovercard and restores the anchor", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();
  await click(q.button("Follow"));

  await press.Escape();
  expect(hovercard()).not.toBeInTheDocument();
  expect(anchor).toHaveFocus();
});
