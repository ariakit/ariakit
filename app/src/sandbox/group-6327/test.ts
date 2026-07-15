import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6327
test("uses aria-label instead of GroupLabel for the group name", () => {
  const group = q.group("Audio playback settings");
  expect(group).toHaveAttribute("aria-label", "Audio playback settings");
  expect(group).not.toHaveAttribute("aria-labelledby");
});

test("preserves explicit aria-labelledby when aria-label is passed", () => {
  const group = q.group("Explicit playback settings");
  expect(group).toHaveAttribute("aria-label", "Audio playback settings");
  expect(group).toHaveAttribute("aria-labelledby", "explicit-group-label");
});
