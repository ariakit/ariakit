import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("applies a density from the customize panel", async () => {
  const customize = q.button("Customize");
  await click(customize);
  expect(customize).toHaveAttribute("aria-expanded", "true");
  await click(q.radio("Compact"));
  expect(q.radio("Compact")).toHaveAttribute("aria-checked", "true");
  await click(q.button("Apply"));
  expect(customize).toHaveAttribute("aria-expanded", "false");
  await click(customize);
  expect(q.radio("Compact")).toHaveAttribute("aria-checked", "true");
});

test("closing the customize panel discards the draft", async () => {
  const customize = q.button("Customize");
  await click(customize);
  await click(q.radio("Compact"));
  await click(customize);
  expect(customize).toHaveAttribute("aria-expanded", "false");
  await click(customize);
  expect(q.radio("Comfortable")).toHaveAttribute("aria-checked", "true");
});
