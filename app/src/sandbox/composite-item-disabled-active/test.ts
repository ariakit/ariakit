import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// happy-dom keeps DOM focus on a natively disabled element, so these duplicates
// pin the navigation break rather than the focus loss: `press` refuses to
// dispatch keys on a disabled control, the same way browsers do. Focus
// retention through the transition is covered by the browser test.

// https://github.com/ariakit/ariakit/issues/7359
test("keeps roving focus on the item that disables itself", async () => {
  const reply = q.button("Roving reply");
  const markAsRead = q.button("Roving mark as read");
  const archive = q.button("Roving archive");

  await click(reply);
  await press.ArrowRight();
  expect(markAsRead).toHaveFocus();

  await press.Enter();
  expect(markAsRead).toHaveFocus();
  expect(markAsRead).toHaveAttribute("aria-disabled", "true");

  await press.ArrowRight();
  expect(archive).toHaveFocus();

  // Once the item no longer holds focus, it goes back to being skipped.
  expect(markAsRead).toBeDisabled();
  await press.ArrowLeft();
  expect(reply).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7359
test("keeps virtual focus on the item that disables itself", async () => {
  const composite = q.toolbar("Virtual message actions");
  const markAsRead = q.button("Virtual mark as read");

  await click(q.button("Virtual reply"));
  await press.ArrowRight();
  expect(markAsRead).toHaveAttribute("data-active-item");

  await press.Enter();
  expect(composite).toHaveFocus();
  // Virtual focus never puts DOM focus on the item, so it must stay natively
  // disabled and keep being skipped.
  expect(markAsRead).toBeDisabled();
  expect(markAsRead).toHaveAttribute("aria-disabled", "true");

  await press.ArrowRight();
  expect(q.button("Virtual archive")).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/issues/7359
test("keeps focus on a controlled active item that disables itself", async () => {
  const markAsRead = q.button("Controlled mark as read");

  await click(q.button("Controlled reply"));
  await press.ArrowRight();
  expect(markAsRead).toHaveFocus();

  await press.Enter();
  expect(markAsRead).toHaveFocus();
  expect(markAsRead).toHaveAttribute("data-active-item");

  await press.ArrowRight();
  expect(q.button("Controlled archive")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7359
test("keeps focus on a native control that disables itself", async () => {
  const markAsRead = q.checkbox("Native mark as read");

  await click(q.button("Native reply"));
  await press.ArrowRight();
  expect(markAsRead).toHaveFocus();

  await press.Space();
  expect(markAsRead).toBeChecked();
  expect(markAsRead).toHaveFocus();
  expect(markAsRead).toHaveAttribute("aria-disabled", "true");

  // The item stays focusable, but it must not activate anymore.
  await press.Space();
  expect(markAsRead).toBeChecked();

  await press.ArrowRight();
  expect(q.button("Native archive")).toHaveFocus();
});

// An item that is not natively focusable loses its `tabindex` rather than
// gaining the native `disabled` attribute, so it drops out of the focus order
// by a different mechanism.
// https://github.com/ariakit/ariakit/issues/7359
test("keeps roving focus on a non-native item that disables itself", async () => {
  const markAsRead = q.button("Non-native mark as read");
  const archive = q.button("Non-native archive");

  await click(q.button("Non-native reply"));
  await press.ArrowRight();
  expect(markAsRead).toHaveFocus();

  await press.Enter();
  expect(markAsRead).toHaveFocus();
  expect(markAsRead).toHaveAttribute("aria-disabled", "true");
  expect(markAsRead).toHaveAttribute("tabindex", "0");

  await press.ArrowRight();
  expect(archive).toHaveFocus();

  // Once the item no longer holds focus, it drops out of the focus order.
  expect(markAsRead).not.toHaveAttribute("tabindex");
});

// The item derives the option only when it is disabled and focused, and falls
// back to undefined rather than false so a composing Focusable can still supply
// it through context.
// https://github.com/ariakit/ariakit/issues/7359
test("keeps an inherited accessibleWhenDisabled working", async () => {
  const markAsRead = q.button("Inherited mark as read");

  // The item is never focused here, so the derivation contributes nothing and
  // the inherited value is the only thing that can keep it out of the native
  // disabled state. Arrow navigation still skips it, because the collection is
  // registered from the raw prop: https://github.com/ariakit/ariakit/issues/7364
  expect(markAsRead).toHaveAttribute("aria-disabled", "true");
  expect(markAsRead).not.toBeDisabled();
});

// https://github.com/ariakit/ariakit/issues/7359
test("honors an explicit accessibleWhenDisabled opt out", async () => {
  const reply = q.button("Opt out reply");
  const markAsRead = q.button("Opt out mark as read");

  await click(reply);
  await press.ArrowRight();
  expect(markAsRead).toHaveFocus();

  await press.Enter();
  expect(markAsRead).toBeDisabled();

  // The opt out accepts the focus loss, so the composite must stay reachable
  // while activeId still points at the disabled item.
  expect(markAsRead).toHaveAttribute("data-active-item");
  await click(q.button("Before opt out"));
  await press.Tab();
  expect(reply).toHaveFocus();
});

// Guards the fix above against regressing the composite entry behavior at the
// Composite layer. https://github.com/ariakit/ariakit/issues/3232 also covers
// this through Toolbar in app/src/sandbox/toolbar-keyboard-navigation.
test("skips an active item that is disabled before it receives focus", async () => {
  await click(q.button("Before initially disabled"));
  await press.Tab();
  expect(q.button("Initially disabled archive")).toHaveFocus();
  expect(q.button("Initially disabled reply")).toBeDisabled();

  await press.Tab();
  expect(q.button("After initially disabled")).toHaveFocus();
});
