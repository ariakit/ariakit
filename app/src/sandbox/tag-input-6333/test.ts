import { q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6333
test("splits string delimiters with regex metacharacters literally", async () => {
  await type("one.two.", q.textbox.ensure("Dot tags"));
  expect(q.text("Dot tags values: one, two")).toBeVisible();
});

test("does not throw on string delimiters that are invalid regex patterns", async () => {
  await type("one+two+", q.textbox.ensure("Plus tags"));
  expect(q.text("Plus tags values: one, two")).toBeVisible();
});
