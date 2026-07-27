import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

for (const trigger of ["click", "Enter", "Space"] as const) {
  test(`toggles a lazy popover with ${trigger}`, async () => {
    const disclosure = q.button("Accept invite");
    if (trigger === "click") {
      await click(disclosure);
    } else if (trigger === "Enter") {
      await press.Enter(disclosure);
    } else {
      await press.Space(disclosure);
    }
    expect(await q.dialog.wait("Team meeting")).toBeVisible();
    await expect.poll(q.button.lazy("Accept")).toHaveFocus();
    await press.ShiftTab();
    if (trigger === "click") {
      await click(disclosure);
    } else if (trigger === "Space") {
      await press.Space(disclosure);
    } else {
      await press.Enter(disclosure);
    }
    expect(q.dialog("Team meeting")).not.toBeInTheDocument();
  });
}

test("hides a lazy popover with Escape from disclosure", async () => {
  await click(q.button("Accept invite"));
  await press.ShiftTab();
  await press.Escape();
  expect(q.dialog("Team meeting")).not.toBeInTheDocument();
});

test("hides a lazy popover with Escape from content", async () => {
  const disclosure = q.button("Accept invite");
  await click(disclosure);
  await press.Escape();
  expect(q.dialog("Team meeting")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});
