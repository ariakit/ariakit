import { click, focus, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on hover when the anchor renders the disabled button", async () => {
  await hover(q.button("Delete file"));
  expect(q.tooltip("You need permission to delete files")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on hover when the disabled button renders the anchor", async () => {
  await hover(q.button("Share file"));
  expect(q.tooltip("You need permission to share files")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on hover when the anchor itself is the disabled one", async () => {
  await hover(q.button("Export file"));
  expect(q.tooltip("You need permission to export files")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on keyboard focus in both composition orders", async () => {
  await press.Tab();
  expect(q.button("Delete file")).toHaveFocus();
  expect(q.tooltip("You need permission to delete files")).toBeVisible();
  await press.Tab();
  expect(q.button("Share file")).toHaveFocus();
  expect(q.tooltip("You need permission to share files")).toBeVisible();
});

test("does not show the tooltip on hover when the consumer opts out for disabled anchors", async () => {
  await hover(q.button("Archive file"));
  expect(
    q.tooltip.maybe("You need permission to archive files"),
  ).not.toBeInTheDocument();
});

test("still shows the tooltip on keyboard focus when hover is opted out", async () => {
  // The same anchor and tooltip as the test above, so that one fails instead of
  // passing vacuously if this tooltip ever stops opening at all. Tab in from
  // the preceding anchor, because a tooltip opens on focus only when Ariakit
  // sees the focus as keyboard focus.
  await focus(q.button("Export file"));
  await press.Tab();
  expect(q.button("Archive file")).toHaveFocus();
  expect(q.tooltip("You need permission to archive files")).toBeVisible();
});

test("lets a callback decide whether a disabled anchor shows on hover", async () => {
  // The callback returns false for this anchor's reason, so a callback that is
  // ignored, coerced to a truthy object, or handed the wrong target would show
  // the tooltip here.
  await hover(q.button("Restore file"));
  expect(
    q.tooltip.maybe("You need permission to restore files"),
  ).not.toBeInTheDocument();
});

test("still shows the tooltip on keyboard focus when a callback declines hover", async () => {
  // The same anchor and tooltip as the test above, so that one fails instead of
  // passing vacuously if this tooltip ever stops opening at all.
  await focus(q.button("Archive file"));
  await press.Tab();
  expect(q.button("Restore file")).toHaveFocus();
  expect(q.tooltip("You need permission to restore files")).toBeVisible();
});

test("shows the tooltip on hover when the rendered element declares itself disabled", async () => {
  // Ariakit resolved no disabled state here, so the anchor still shows its
  // tooltip on hover, the way it did before the hover decision started reading
  // the element.
  await hover(q.button("Publish file"));
  expect(q.tooltip("Publishing needs a reviewer")).toBeVisible();
});

test("shows the tooltip on keyboard focus when the rendered element declares itself disabled", async () => {
  // The pointer and keyboard halves have to agree. Revealing on focus while
  // withholding on hover is what the truly disabled rule exists to prevent, in
  // reverse.
  await focus(q.button("Restore file"));
  await press.Tab();
  expect(q.button("Publish file")).toHaveFocus();
  expect(q.tooltip("Publishing needs a reviewer")).toBeVisible();
});

test("keeps truly disabled anchors out of pointer reach", async () => {
  // Focusable applies `pointer-events: none` to truly disabled elements, so no
  // mouse move can reach these anchors and the shield is the behavior here. The
  // hover decision is covered by the two tests below, where it's lifted.
  expect(q.button("Rename file")).toHaveStyle("pointer-events: none");
  expect(q.button("Move file")).toHaveStyle("pointer-events: none");
});

test("does not show the tooltip on hover for a truly disabled anchor that keeps pointer events", async () => {
  // Restoring pointer events is what makes this the hover decision's own test:
  // the mouse move reaches the anchor and only the resolved disabled state can
  // keep the tooltip closed.
  expect(q.button("Duplicate file")).toHaveStyle("pointer-events: auto");
  await hover(q.button("Duplicate file"));
  expect(q.tooltip.maybe("Duplicating is unavailable")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7116
test("does not show the tooltip on hover when the truly disabled state is below the anchor", async () => {
  expect(q.button("Print file")).toHaveStyle("pointer-events: auto");
  await hover(q.button("Print file"));
  expect(q.tooltip.maybe("Printing is unavailable")).not.toBeInTheDocument();
});

test("opens a delayed tooltip on hover", async () => {
  await hover(q.button("Preview file"));
  // The provider delays the show by 150ms, and nothing observable tracks the
  // pending timeout, so the wait has to cross it. This is the control for the
  // test below, which uses the same delay.
  await sleep(250);
  expect(q.tooltip("Opens a read-only preview")).toBeVisible();
});

test("does not open a delayed tooltip when the anchor turns truly disabled while it is pending", async () => {
  await hover(q.button("Sync file"));
  // Hovering revoked the access that kept this anchor explainable, so it is
  // truly disabled by now and dropped out of the tab order.
  expect(q.button("Sync file")).not.toHaveAttribute("tabindex");
  // Same 150ms show timeout as the control above, and still nothing observable
  // to poll, so cross it before asserting the tooltip stayed closed.
  await sleep(250);
  expect(q.tooltip.maybe("Syncing needs access")).not.toBeInTheDocument();
});

test("shows the tooltip on hover when the rendered button is disabled with focusable false", async () => {
  // `focusable={false}` makes the button's disabled props inoperative, so the
  // anchor keeps the element keyboard reachable and reveals on focus. Hover
  // has to agree, or the tooltip becomes keyboard-only.
  await hover(q.button("Compress file"));
  expect(q.tooltip("Compression runs in the background")).toBeVisible();
});

test("shows the tooltip on keyboard focus when the rendered button is disabled with focusable false", async () => {
  // The keyboard half of the parity the test above locks in.
  await focus(q.button("Preview file"));
  await press.Tab();
  expect(q.button("Compress file")).toHaveFocus();
  expect(q.tooltip("Compression runs in the background")).toBeVisible();
});

test("does not show the tooltip on hover when the anchor is disabled with focusable false", async () => {
  // With `focusable={false}` the anchor has no tab stop and no focus reveal,
  // so revealing on hover would reach pointer users alone. No pointer-events
  // shield applies here, so the hover decision itself is what this asserts.
  expect(q.text("Encrypt file")).not.toHaveAttribute("tabindex");
  await hover(q.text("Encrypt file"));
  expect(q.tooltip.maybe("Encryption is unavailable")).not.toBeInTheDocument();
});

test("does not open a delayed tooltip when the anchor loses focusable while it is pending", async () => {
  await hover(q.text("Upload file"));
  // Hovering locked the upload, so the anchor is now disabled with
  // `focusable={false}` and out of the tab order.
  expect(q.text("Upload file")).not.toHaveAttribute("tabindex");
  // Same 150ms show timeout as the "Preview file" control above, and still
  // nothing observable to poll, so cross it before asserting the tooltip
  // stayed closed.
  await sleep(250);
  expect(
    q.tooltip.maybe("Uploading needs a connection"),
  ).not.toBeInTheDocument();
});

test("shows the tooltip on hover when the rendered element carries the attribute with a false value", async () => {
  // Only Ariakit's stamped value counts, so a render component emitting
  // data-truly-disabled="false" for its own styling keeps its hover behavior.
  await hover(q.button("Tag file"));
  expect(q.tooltip("Tags help you find files")).toBeVisible();
});

test("keeps the disabled semantics on accessible disabled anchors", async () => {
  expect(q.button("Delete file")).toHaveAttribute("aria-disabled", "true");
  expect(q.button("Share file")).toHaveAttribute("aria-disabled", "true");
  expect(q.button("Export file")).toHaveAttribute("aria-disabled", "true");
});

test("does not put accessible disabled anchors in the pressed state", async () => {
  // Activation stays suppressed on these anchors, so Space must not make them
  // look pressed either, in either composition order.
  const anchorFirst = q.button("Delete file");
  await focus(anchorFirst);
  // Space falls back to the active element, so an anchor that stopped being
  // focusable would leave these assertions passing against the body.
  expect(anchorFirst).toHaveFocus();
  await press.down.Space();
  expect(anchorFirst).not.toHaveAttribute("data-active");
  await press.up.Space();

  const buttonFirst = q.button("Share file");
  await focus(buttonFirst);
  expect(buttonFirst).toHaveFocus();
  await press.down.Space();
  expect(buttonFirst).not.toHaveAttribute("data-active");
  await press.up.Space();
});

test("does not activate accessible disabled anchors", async () => {
  await click(q.button("Delete file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  await click(q.button("Share file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  await click(q.button("Export file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  await click(q.button("Archive file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  await click(q.button("Restore file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  // The same handler on an enabled button, so the assertions above fail if the
  // counter ever stops counting rather than if the clicks are suppressed.
  await click(q.button("Download file"));
  expect(q.text("Activations: 1")).toBeInTheDocument();
});
