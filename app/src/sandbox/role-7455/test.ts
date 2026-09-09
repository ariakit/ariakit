import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders native Role helpers and forwards refs and props", async () => {
  expect(q.text("⌘K").tagName).toBe("KBD");
  expect(q.text("⌘K")).toHaveAttribute("title", "Command K");
  expect(q.separator().tagName).toBe("HR");
  expect(q.separator()).toHaveAttribute("aria-label", "Commands");
  expect(q.text("September 9")).toHaveAttribute("datetime", "2026-09-09");
  expect(q.cell("Open search").tagName).toBe("TD");
  expect(q.cell("Open search")).toHaveAttribute("colspan", "2");
  expect(q.group("Settings")).toHaveAttribute("disabled", "");
  expect(q.option("Keyboard")).toHaveAttribute("value", "keyboard");
  await click(q.button("Inspect elements"));
  expect(q.status("Element refs")).toHaveTextContent(
    "kbd, hr, time, td, fieldset, option",
  );
});

test("preserves render replacement and framework wrapping", async () => {
  expect(q.text("Ctrl K").tagName).toBe("SPAN");
  expect(q.text("Ctrl K")).toHaveAttribute("title", "Control K");
  expect(q.group("Shortcut")).toHaveTextContent("Ctrl K");
  await click(q.button("Inspect elements"));
  expect(q.status("Composed ref")).toHaveTextContent("span");
});
