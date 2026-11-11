import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the scroll area and the copy button with the title", async () => {
  expect(q.region("format-price.ts")).toHaveAttribute("tabindex", "0");
  // The block has no label for the button, so it takes it from the title.
  await click(q.button("Copy format-price.ts"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toMatch(
    /^export function formatPrice\(/,
  );
});
