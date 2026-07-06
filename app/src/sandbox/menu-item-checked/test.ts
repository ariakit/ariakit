import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6318
test("syncs boolean item checked state with menu values", async () => {
  await click(q.button("View"));

  expect(q.menuitemcheckbox("Show sidebar")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(q.menuitemcheckbox("Minimap")).toHaveAttribute("aria-checked", "true");
  expect(q.status("Menu values")).toHaveTextContent(
    '{"showSidebar":true,"minimap":true}',
  );
});

test("does not leak defaultChecked to the rendered menu item", () => {
  const item = q.menuitemradio("Compact");
  expect(item).toHaveAttribute("aria-checked", "true");
  expect(item).not.toHaveAttribute("data-default-checked-prop");
});
