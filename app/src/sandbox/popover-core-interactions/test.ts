import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("toggles provider popover with click, Enter, and Space", async () => {
  const disclosure = q.button("Accept invite");

  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();
  await click(disclosure);
  expect(q.dialog("Team meeting")).toBeVisible();
  expect(q.button("Accept")).toHaveFocus();
  await click(disclosure);
  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();

  await press.Enter(disclosure);
  expect(q.dialog("Team meeting")).toBeVisible();
  await press.ShiftTab();
  await press.Enter();
  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();

  await press.Space(disclosure);
  expect(q.dialog("Team meeting")).toBeVisible();
  await press.ShiftTab();
  await press.Space();
  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();
});

test("hides provider popover with Escape from disclosure and content", async () => {
  const disclosure = q.button("Accept invite");

  await click(disclosure);
  await press.ShiftTab();
  expect(q.dialog("Team meeting")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();

  await click(disclosure);
  expect(q.button("Accept")).toHaveFocus();
  await press.Escape();
  expect(q.dialog.maybe("Team meeting")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});

test("controlled standalone popover closes through onClose", async () => {
  const disclosure = q.button("Review invite");

  await click(disclosure);
  expect(q.dialog("Review meeting")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Review meeting")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});

for (const trigger of ["click", "Enter", "Space"] as const) {
  test(`toggles controlled standalone popover with ${trigger}`, async () => {
    const disclosure = q.button("Review invite");
    if (trigger === "click") {
      await click(disclosure);
    } else if (trigger === "Enter") {
      await press.Enter(disclosure);
    } else {
      await press.Space(disclosure);
    }
    expect(q.dialog("Review meeting")).toBeVisible();
    expect(q.button("Confirm")).toHaveFocus();
    await press.ShiftTab();
    if (trigger === "click") {
      await click(disclosure);
    } else if (trigger === "Enter") {
      await press.Enter(disclosure);
    } else {
      await press.Space(disclosure);
    }
    expect(q.dialog.maybe("Review meeting")).not.toBeInTheDocument();
  });
}

test("hides controlled standalone popover with Escape from disclosure", async () => {
  await click(q.button("Review invite"));
  await press.ShiftTab();
  await press.Escape();
  expect(q.dialog.maybe("Review meeting")).not.toBeInTheDocument();
});
