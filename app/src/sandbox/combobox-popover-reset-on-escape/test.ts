import { click, dispatch, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649285785
test("restores the value from before the popover was shown", async () => {
  await click(q.combobox("Mounted"));
  await press.ArrowDown();
  expect(q.combobox("Mounted")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Mounted")).toHaveTextContent("Apple");
});

test("restores the previous value with unmountOnHide", async () => {
  await click(q.combobox("Unmounted"));
  await press.ArrowDown();
  expect(q.combobox("Unmounted")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Unmounted")).toHaveTextContent("Apple");
});

test("honors a resetOnEscape callback", async () => {
  await click(q.combobox("Callback"));
  await press.ArrowDown();
  expect(q.combobox("Callback")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Callback")).toHaveTextContent("Banana");
});

test("restores after the active item is cleared by hovering out", async () => {
  await click(q.combobox("Mounted"));
  await press.ArrowDown();
  expect(q.combobox("Mounted")).toHaveTextContent("Banana");
  await hover(q.option("Banana"));
  await hover(document.body);
  expect(q.combobox("Mounted")).not.toHaveAttribute("aria-activedescendant");
  await press.Escape();
  expect(q.combobox("Mounted")).toHaveTextContent("Apple");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("keeps the value when a descendant consumes Escape", async () => {
  await click(q.combobox("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await click(q.button("Handles escape"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

test("still restores when the descendant is out of the event path", async () => {
  await click(q.combobox("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Apple");
});

test("keeps the previewed value when clicking outside after a consumed Escape", async () => {
  await click(q.combobox("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await click(q.button("Handles escape"));
  await press.Escape();
  await click(document.body);
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("keeps the value when a descendant stops the Escape propagation", async () => {
  await click(q.combobox("Propagation"));
  await press.ArrowDown();
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
  await click(q.button("Stops propagation"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
  await click(q.option("Banana"));
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
});

test("still restores when hideOnEscape prevents the default", async () => {
  await click(q.combobox("Prevented"));
  await press.ArrowDown();
  expect(q.combobox("Prevented")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Prevented")).toHaveTextContent("Apple");
});

test("keeps the previewed value when the popover is toggled closed after a consumed Escape", async () => {
  await click(q.combobox("Descendant"));
  await press.ArrowDown();
  await click(q.button("Handles escape"));
  await press.Escape();
  await click(q.combobox("Descendant"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("reports one closing Escape per keypress", async () => {
  await click(q.combobox("Counted"));
  expect(q.status("Counted counts")).toHaveTextContent(
    "reset:0 close:0 events:",
  );
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.status("Counted counts")).toHaveTextContent(
    "reset:1 close:1 events:close,reset",
  );
});

test("reports one reset for a controlled close request", async () => {
  await click(q.combobox("Controlled counted"));
  await press.ArrowDown();
  expect(q.combobox("Controlled counted")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Controlled counted")).toHaveTextContent("Apple");
  expect(q.status("Controlled counted counts")).toHaveTextContent(/^reset:1\b/);
});

test("reports nothing when a descendant keeps the popover open", async () => {
  await click(q.combobox("Counted"));
  await click(q.button("Swallows escape"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.status("Counted counts")).toHaveTextContent(
    "reset:0 close:0 events:",
  );
});

test("doesn't reset when onClose prevents the close", async () => {
  await click(q.combobox("Vetoed"));
  await press.ArrowDown();
  expect(q.combobox("Vetoed")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vetoed")).toHaveTextContent("Banana");
  expect(q.status("Vetoed counts")).toHaveTextContent(
    "reset:0 close:2 events:close,close",
  );
});

test("preserves the original baseline after a prevented close", async () => {
  await click(q.combobox("Vetoed once"));
  await press.ArrowDown();
  expect(q.combobox("Vetoed once")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vetoed once")).toHaveTextContent("Banana");
  expect(q.status("Vetoed once ready")).toHaveTextContent("ready");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Vetoed once")).toHaveTextContent("Apple");
});

test("keeps tracking the baseline after a close is prevented before moving", async () => {
  await click(q.combobox("Vetoed before move"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.status("Vetoed before move ready")).toHaveTextContent("ready");
  await click(q.button("Set selection after veto"));
  expect(q.combobox("Vetoed before move")).toHaveTextContent("Banana");
  q.combobox.ensure("Vetoed before move").focus();
  await press.End();
  expect(q.combobox("Vetoed before move")).toHaveTextContent("Grape");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Vetoed before move")).toHaveTextContent("Banana");
});

test("keeps tracking a synchronous selection update from a vetoing onClose", async () => {
  await click(q.combobox("Vetoed with selection"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vetoed with selection")).toHaveTextContent("Banana");
  expect(q.status("Vetoed with selection ready")).toHaveTextContent("ready");
  q.combobox.ensure("Vetoed with selection").focus();
  await press.End();
  expect(q.combobox("Vetoed with selection")).toHaveTextContent("Grape");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Vetoed with selection")).toHaveTextContent("Banana");
});

test("doesn't reset for a different close from a consumed Escape", async () => {
  await click(q.combobox("Descendant close"));
  await press.ArrowDown();
  expect(q.combobox("Descendant close")).toHaveTextContent("Banana");
  await click(q.button("Consumes Escape and closes"));
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant close")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/issues/5695
test("resets after an unprevented controlled close request", async () => {
  await click(q.combobox("Controlled open"));
  await press.ArrowDown();
  expect(q.combobox("Controlled open")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Controlled open")).toHaveTextContent("Apple");
});

test("doesn't reuse a consumed Escape for a later close", async () => {
  await click(q.combobox("Counted"));
  await press.ArrowDown();
  await click(q.button("Swallows escape"));
  await press.Escape();
  await click(q.combobox("Counted"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Counted")).toHaveTextContent("Banana");
  expect(q.status("Counted counts")).toHaveTextContent(
    "reset:0 close:1 events:close",
  );
});

test("restores independently across open sessions", async () => {
  await click(q.combobox("Counted"));
  await press.ArrowDown();
  await press.Escape();
  expect(q.combobox("Counted")).toHaveTextContent("Apple");
  await click(q.combobox("Counted"));
  await press.ArrowDown();
  await press.Escape();
  expect(q.combobox("Counted")).toHaveTextContent("Apple");
  expect(q.status("Counted counts")).toHaveTextContent(
    "reset:2 close:2 events:close,reset,close,reset",
  );
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650305278
test("doesn't render the popover when the selected value changes", async () => {
  await click(q.combobox("Render counted"));
  const renderCount = q.status.ensure("Render counted popover renders");
  const countBeforeChange = renderCount.textContent;
  await dispatch.click(q.button("Set render counted selection"));
  expect(q.combobox("Render counted")).toHaveTextContent("Banana");
  expect(renderCount).toHaveTextContent(countBeforeChange ?? "");
});

test("tracks selection changes before the first move", async () => {
  await click(q.combobox("Render counted"));
  await click(q.button("Set render counted selection"));
  expect(q.combobox("Render counted")).toHaveTextContent("Banana");
  q.combobox.ensure("Render counted").focus();
  await press.ArrowDown();
  expect(q.combobox("Render counted")).toHaveTextContent("Banana");
  await press.ArrowDown();
  expect(q.combobox("Render counted")).toHaveTextContent("Grape");
  await press.Escape();
  expect(q.combobox("Render counted")).toHaveTextContent("Banana");
});

test("doesn't re-arm selection capture when moves reset while open", async () => {
  await click(q.combobox("Render counted"));
  await press.ArrowDown();
  expect(q.combobox("Render counted")).toHaveTextContent("Banana");
  await click(q.button("Reset render counted moves"));
  await press.ArrowDown();
  expect(q.combobox("Render counted")).toHaveTextContent("Grape");
  await press.Escape();
  expect(q.combobox("Render counted")).toHaveTextContent("Apple");
});

test("captures the baseline when an already-open store replaces the store", async () => {
  await click(q.combobox("Store replacement"));
  await press.ArrowDown();
  expect(q.combobox("Store replacement")).toHaveTextContent("Banana");
  await click(q.button("Replace open store"));
  expect(q.listbox()).toBeVisible();
  q.combobox.ensure("Store replacement").focus();
  await press.End();
  expect(q.combobox("Store replacement")).toHaveTextContent("Grape");
  await press.Escape();
  expect(q.combobox("Store replacement")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306657
test("doesn't steal focus after focus leaves the popover", async () => {
  await click(q.combobox("Render counted"));
  const popover = q.listbox.ensure();
  const target = q.button.ensure("External focus target");
  popover.focus();
  target.focus();
  await Promise.resolve();
  expect(target).toHaveFocus();
});
