import { hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// happy-dom reports a platform that is not Apple, so the shortcuts use Control.

test("names the icon buttons and shows their shortcuts on hover", async () => {
  const bold = q.button("Bold");
  expect(bold).toHaveAttribute("aria-keyshortcuts", "Control+B");
  await hover(bold);
  expect(await q.tooltip.wait(/^Bold/)).toHaveTextContent("BoldCtrl+B");
});

test("shows the tooltip on keyboard focus and hides it on Escape", async () => {
  await press.Tab();
  expect(q.button("Bold")).toHaveFocus();
  expect(await q.tooltip.wait(/^Bold/)).toBeVisible();
  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
  expect(await q.tooltip.wait(/^Italic/)).toBeVisible();
  await press.Escape();
  expect(q.tooltip.maybe(/^Italic/)).not.toBeInTheDocument();
  expect(q.button("Italic")).toHaveFocus();
});
