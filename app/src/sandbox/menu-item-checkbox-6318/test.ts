import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("syncs boolean item checked state with menu values", async () => {
  await click(q.button.ensure("View"));

  expect(q.menuitemcheckbox("Show sidebar")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(q.menuitemcheckbox("Minimap")).toHaveAttribute("aria-checked", "true");
  expect(q.status("Menu values")).toHaveTextContent(
    '{"showSidebar":true,"minimap":true}',
  );
});
