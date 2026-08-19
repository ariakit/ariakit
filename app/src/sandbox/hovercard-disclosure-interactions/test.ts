import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const disclosure = () => q.button(/^More details/);

test("shows the hovercard after hovering", async () => {
  await hover(q.link("@ariakit.com"));
  expect(await q.dialog.wait("Ariakit")).toBeVisible();
});

test("keeps the disclosure hidden after mouse focus", async () => {
  await click(q.link("@ariakit.com"));
  expect(disclosure()).toHaveStyle({ height: "1px" });
});

test("shows and focuses the disclosure with the keyboard", async () => {
  await press.Tab();
  expect(disclosure()).not.toHaveStyle({ height: "1px" });
  await press.Tab();
  expect(disclosure()).toHaveFocus();
});

for (const trigger of ["click", "Enter", "Space"] as const) {
  test(`toggles the hovercard disclosure with ${trigger}`, async () => {
    await press.Tab();
    await press.Tab();
    if (trigger === "click") {
      await click(disclosure());
    } else if (trigger === "Enter") {
      await press.Enter(disclosure());
    } else {
      await press.Space(disclosure());
    }
    expect(q.dialog("Ariakit")).toBeVisible();
    expect(q.link("Follow")).toHaveFocus();
    await press.ShiftTab();
    if (trigger === "click") {
      await click(disclosure());
    } else if (trigger === "Enter") {
      await press.Enter(disclosure());
    } else {
      await press.Space(disclosure());
    }
    expect(q.dialog.maybe("Ariakit")).not.toBeInTheDocument();
    expect(disclosure()).toHaveFocus();
  });
}

test("Escape restores focus to the anchor", async () => {
  await press.Tab();
  await press.Tab();
  await press.Enter();
  await press.Escape();
  expect(q.dialog.maybe("Ariakit")).not.toBeInTheDocument();
  expect(q.link("@ariakit.com")).toHaveFocus();
});

test("hovering after disclosure use does not autofocus the card", async () => {
  const anchor = q.link("@ariakit.com");
  await press.Tab();
  await press.Tab();
  await press.Enter();
  await press.Escape();
  await hover(anchor);
  expect(await q.dialog.wait("Ariakit")).toBeVisible();
  expect(anchor).toHaveFocus();
});

test("hides the disclosure when keyboard focus leaves", async () => {
  await press.Tab();
  expect(disclosure()).not.toHaveStyle({ height: "1px" });
  await press.Tab();
  expect(disclosure()).toHaveFocus();
  await press.Tab();
  expect(q.button("After profile")).toHaveFocus();
  expect(disclosure()).toHaveStyle({ height: "1px" });
  await press.ShiftTab();
  expect(disclosure()).not.toHaveStyle({ height: "1px" });
  await press.ShiftTab();
  expect(disclosure()).not.toHaveStyle({ height: "1px" });
});
