import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("inherits accessibleWhenDisabled through composition", () => {
  const qq = q.within(document.getElementById("inherited"));
  const button = qq.button("Inherited");
  // The button inherits `accessibleWhenDisabled` from the composed `Focusable`
  // (the metadata flows through the `render`/`As` composition), so it stays
  // focusable: `aria-disabled` is set but the native `disabled` attribute is
  // not.
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).not.toBeDisabled();
});

test("disabled button without inheritance is fully disabled", () => {
  const qq = q.within(document.getElementById("plain"));
  const button = qq.button("Plain");
  expect(button).toBeDisabled();
});
