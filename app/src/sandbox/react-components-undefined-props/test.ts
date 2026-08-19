import { click, hover, press, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined autoFocusOnShow keeps focus outside the hovercard", async () => {
  await hover(q.link("@ariakit/react"));
  await expect.poll(() => q.dialog("Ariakit package")).toBeVisible();
  // Asserting that focus does *not* move has no observable state to retry
  // against, so settle the popover's auto-focus effect before asserting.
  await sleep();
  expect(q.button("Star")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined focusable keeps the tab panel out of the tab order", async () => {
  expect(q.tabpanel("Links")).not.toHaveAttribute("tabindex");
});

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined clickOnEnter keeps Enter inert on a native checkbox", async () => {
  const checkbox = q.checkbox("Subscribe");
  await click(checkbox);
  expect(checkbox).toBeChecked();
  await press.Enter(checkbox);
  expect(checkbox).toBeChecked();
});

// https://github.com/ariakit/ariakit/issues/7028
test("explicit autoFocusOnShow still overrides the computed default", async () => {
  await hover(q.link("@ariakit/docs"));
  await expect.poll(() => q.dialog("Ariakit docs")).toBeVisible();
  await expect.poll(() => q.button("Read")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7028
test("explicit focusable still overrides the computed default", async () => {
  await click(q.tab("Text"));
  expect(q.tabpanel("Text")).not.toHaveAttribute("tabindex");
});

// https://github.com/ariakit/ariakit/issues/7028
test("explicit clickOnEnter still overrides the computed default", async () => {
  const checkbox = q.checkbox("Notify");
  await click(checkbox);
  expect(checkbox).toBeChecked();
  await press.Enter(checkbox);
  expect(checkbox).not.toBeChecked();
});

// https://github.com/ariakit/ariakit/issues/7037
test("a composed hook preserves a later computed default", async () => {
  const combobox = q.combobox("Direct hook");
  await type("a", combobox);
  await expect.poll(q.listbox.lazy()).toBeVisible();
  // The assertion is about focus not moving, so wait for the popover's
  // auto-focus effect before checking the steady state.
  await sleep();
  expect(combobox).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7037
test("a dialog hook preserves its computed disabled state", () => {
  expect(q.dialog("Hook dialog")).toHaveAttribute("aria-disabled", "true");
});

// https://github.com/ariakit/ariakit/issues/7037
test("a toolbar container hook preserves its computed disabled state", () => {
  expect(q.group("Hook toolbar container")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

// https://github.com/ariakit/ariakit/issues/7037
test("a form checkbox preserves its field name and external label", () => {
  expect(q.checkbox("Newsletter")).toHaveAttribute("name", "newsletter");
});

// https://github.com/ariakit/ariakit/issues/7037
test("a composed form radio preserves its field name", () => {
  expect(q.radio("Basic plan")).toHaveAttribute("name", "plan");
});

// https://github.com/ariakit/ariakit/issues/7028
test("a hook's own undefined sentinel still suppresses a later computed value", () => {
  expect(q.checkbox("Accept terms")).not.toHaveAttribute("aria-labelledby");
});
