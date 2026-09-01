import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

const virtualFocusWarning =
  "A composite widget with `virtualFocus` enabled requires a focusable " +
  "composite element. Set the `focusable` prop to `true` or the " +
  "`virtualFocus` option to `false`.";

// The composite element is published one commit after the items mount, so
// gating only on it would drop roving tabindex for composite stores that never
// get a composite element.
// https://github.com/ariakit/ariakit/pull/6832
test("keeps a single tab stop per composite once hydrated", async () => {
  await press.Tab();
  expect(q.option("Starred")).toHaveFocus();

  await press.Tab();
  expect(q.listbox("Virtual focus")).toHaveFocus();

  await press.Tab();
  expect(q.listbox("Seeded")).toHaveFocus();

  await press.Tab();
  expect(q.option("Spam")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/4767
test("does not redirect focus to a non-focusable virtual focus owner", async () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const primary = q.option("Primary");
  await click(primary);
  expect(primary).toHaveFocus();

  await press.ArrowDown();
  const social = q.option("Social");
  expect(social).toHaveFocus();
  expect(social).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const updates = q.option("Updates");
  expect(updates).toHaveFocus();
  expect(updates).toHaveAttribute("data-focus-visible", "true");
  expect(primary).not.toHaveAttribute("data-focus-visible");
  expect(social).not.toHaveAttribute("data-focus-visible");
  expect(consoleWarn).toHaveBeenCalledTimes(1);
  expect(consoleWarn).toHaveBeenCalledWith(virtualFocusWarning);
});

// https://github.com/ariakit/ariakit/issues/7364
test("moves to an accessible disabled item inherited through composition", async () => {
  await click(q.option("Inherited one"));
  expect(q.option("Inherited one")).toHaveFocus();

  const accessibleDisabledItem = q.option("Inherited two");
  expect(accessibleDisabledItem).toHaveAttribute("aria-disabled", "true");
  expect(accessibleDisabledItem).not.toHaveAttribute("disabled");

  await press.ArrowRight();
  expect(accessibleDisabledItem).toHaveFocus();
});

// `useCompositeItem` must read the `accessibleWhenDisabled` metadata without
// replacing the carrier, or a composed `Command` loses its own marker. No
// user-facing behavior exposes this because `useCommand` returns on
// `defaultPrevented` before checking the marker, so `MetadataProbe` counts it.
test("preserves command metadata on composed items", () => {
  expect(q.option("Metadata command")).toHaveAttribute(
    "data-metadata-count",
    "1",
  );
});

// https://github.com/ariakit/ariakit/pull/7376#discussion_r3900826323
test("skips a disabled item with an inactive Focusable", async () => {
  await click(q.option("Inactive one"));
  await press.ArrowRight();
  expect(q.option("Inactive three")).toHaveFocus();
});
