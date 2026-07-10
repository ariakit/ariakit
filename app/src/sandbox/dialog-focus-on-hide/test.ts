import { click, q, sleep } from "@ariakit/test";
import * as React from "react";
import { expect, test } from "vitest";

test("restores focus once with the latest callback", async () => {
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);

  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);

  await click(q.button("Use second callback"));
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);

  await click(q.button("Close dialog"));

  expect(q.status("Focus callbacks")).toHaveTextContent(/^second$/);
  expect(q.button("Open dialog")).toHaveFocus();
});

const activityTest = "Activity" in React ? test : test.skip;

activityTest("restores focus when Activity hides the dialog", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);

  await click(q.button("Hide activity"));

  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^first$/);
  expect(q.button("Open dialog")).toHaveFocus();
});

test("does not restore focus from a replaced dialog", async () => {
  await click(q.button("Open dialog without final focus"));
  await click(q.button("Remount dialog"));

  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);
});

test("does not restore focus from a replaced portaled dialog", async () => {
  await click(q.button("Open portaled dialog without final focus"));
  await click(q.button("Remount dialog"));

  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);
});

test("does not restore focus when disabled", async () => {
  await click(q.button("Open dialog"));
  await click(q.button("Disable focus restoration"));
  await click(q.button("Close dialog"));
  await sleep();

  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);
});

test("does not restore focus after reopening before a retry", async () => {
  await click(q.button("Open dialog"));
  await click(q.button("Close and reopen dialog"));
  await sleep();

  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^none$/);
});

test("does not run a superseded retry after the replacement closes", async () => {
  await click(q.button("Open dialog"));
  await click(q.button("Close replacement before retry"));
  await sleep();

  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(q.status("Focus callbacks")).toHaveTextContent(/^first$/);
});

activityTest(
  "does not restore focus again after closing while hidden",
  async () => {
    await click(q.button("Open dialog"));
    await click(q.button("Prevent focus restoration"));
    await click(q.button("Hide, close, and show activity"));

    await expect
      .poll(() => q.status.ensure("Dialog state").textContent)
      .toBe("visible, closed");
    await sleep();
    expect(q.status("Focus callbacks")).toHaveTextContent(/^first$/);
  },
);
