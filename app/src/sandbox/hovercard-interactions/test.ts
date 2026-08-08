import { click, dispatch, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

const hovercard = () => q.dialog("Ariakit profile");

const hoverOutside = async () => {
  await hover(document.body, { clientX: 10, clientY: 10 });
};

// https://github.com/ariakit/ariakit/issues/7043
test("shows after hovering and hides after hovering outside", async () => {
  expect(hovercard()).not.toBeInTheDocument();

  // Dispatch directly so the assertions run before the timeout can expire
  // when the full suite delays the interaction helper.
  await dispatch.mouseMove(q.link("@ariakit.com"));
  expect(hovercard()).not.toBeInTheDocument();
  await expect.poll(hovercard).toBeVisible();

  await dispatch.mouseMove(document.body);
  expect(hovercard()).toBeVisible();
  await expect.poll(hovercard).not.toBeInTheDocument();
});

test("stays open while focused", async () => {
  await hover(q.link("@ariakit.com"));
  await expect.poll(hovercard).toBeVisible();
  await click(q.button("Follow"));

  await hoverOutside();
  // Cross the provider's 200ms hide timeout to prove focus keeps it open.
  await sleep(300);
  expect(hovercard()).toBeVisible();
});

test("stays open when the pointer quickly returns", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await hoverOutside();
  // Return before the provider's 200ms hide timeout elapses.
  await sleep(50);
  await hover(anchor);
  // Cross the hide timeout to prove the pending close was canceled.
  await sleep(300);
  expect(hovercard()).toBeVisible();

  await hoverOutside();
  // Return before the provider's 200ms hide timeout elapses.
  await sleep(50);
  await hover(q.button("Follow"));
  // Cross the hide timeout to prove the pending close was canceled.
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
