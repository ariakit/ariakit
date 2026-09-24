import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const trigger of ["click", "Enter", "Space"] as const) {
  test(`opens from the disclosure with ${trigger}`, async () => {
    const disclosure = q.button("Show modal");
    if (trigger === "click") {
      await click(disclosure);
    } else if (trigger === "Enter") {
      await press.Enter(disclosure);
    } else {
      await press.Space(disclosure);
    }

    expect(q.dialog("Success")).toBeVisible();
    expect(q.button("OK")).toHaveFocus();
  });
}

test("keeps focus on the only dialog button with synthetic Tab", async () => {
  await click(q.button("Show modal"));
  expect(q.button("OK")).toHaveFocus();

  await press.Tab();
  expect(q.button("OK")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("OK")).toHaveFocus();
});

test("closes with Escape and restores disclosure focus", async () => {
  const disclosure = q.button("Show modal");
  await click(disclosure);
  await press.Escape();

  expect(q.dialog.maybe("Success")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});

test("closes on outside click without restoring disclosure focus", async () => {
  const disclosure = q.button("Show modal");
  const outside = q.button("Outside dialog");
  await click(disclosure);
  await click(outside);

  expect(q.dialog.maybe("Success")).not.toBeInTheDocument();
  expect(disclosure).not.toHaveFocus();
});

// The fix for #7616 runs onClose before the open state changes, so the outside
// interaction must be recorded before the close request for this to hold.
// https://github.com/ariakit/ariakit/issues/7616
test("closes on a synchronous outside click without restoring disclosure focus", async () => {
  const disclosure = q.button("Show details");
  await click(disclosure);
  expect(q.dialog("Details")).toBeVisible();

  await click(q.text("Text outside the details"));
  expect(q.dialog.maybe("Details")).not.toBeInTheDocument();
  expect(document.body).toHaveFocus();
});

// The fix for #7616 runs onClose before the open state changes, so hiding the
// store from onClose must not dispatch the close event again.
// https://github.com/ariakit/ariakit/issues/7616
test("closes once when onClose hides the store on Escape", async () => {
  await click(q.button("Show settings"));
  expect(q.dialog("Settings")).toBeVisible();

  await press.Escape();
  expect(q.dialog.maybe("Settings")).not.toBeInTheDocument();
  expect(q.text("Settings close events: 1")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7616
test("closes once when onClose hides the store from the dismiss button", async () => {
  await click(q.button("Show settings"));
  expect(q.dialog("Settings")).toBeVisible();

  await click(q.button("Close settings"));
  expect(q.dialog.maybe("Settings")).not.toBeInTheDocument();
  expect(q.text("Settings close events: 1")).toBeVisible();
});

for (const trigger of ["click", "Enter", "Space"] as const) {
  test(`closes from the dismiss button with ${trigger}`, async () => {
    const disclosure = q.button("Show modal");
    await click(disclosure);
    const dismiss = q.button("OK");

    if (trigger === "click") {
      await click(dismiss);
    } else if (trigger === "Enter") {
      await press.Enter(dismiss);
    } else {
      await press.Space(dismiss);
    }

    expect(q.dialog.maybe("Success")).not.toBeInTheDocument();
    expect(disclosure).toHaveFocus();
  });
}
