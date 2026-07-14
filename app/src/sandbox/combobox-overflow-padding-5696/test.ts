// See https://github.com/ariakit/ariakit/issues/5696
import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("supports object overflow padding in CSS sizing", () => {
  const popover = q.listbox.ensure();
  // Popover exposes positioning styles on the element's wrapper.
  expect(popover.parentElement).toHaveStyle("--popover-overflow-padding: 32px");
});
