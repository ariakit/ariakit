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

test("traps focus inside the dialog", async () => {
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

  expect(q.dialog("Success")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});

test("closes on outside click without restoring disclosure focus", async () => {
  const disclosure = q.button("Show modal");
  const outside = q.button("Outside dialog");
  await click(disclosure);
  await click(outside);

  expect(q.dialog("Success")).not.toBeInTheDocument();
  expect(disclosure).not.toHaveFocus();
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

    expect(q.dialog("Success")).not.toBeInTheDocument();
    expect(disclosure).toHaveFocus();
  });
}
