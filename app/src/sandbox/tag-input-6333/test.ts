import { q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6333
test("splits string delimiters with regex metacharacters literally", async () => {
  await type("one.two.", q.textbox("Dot tags"));
  expect(q.text("Dot tags values: one, two")).toBeVisible();
});

test("does not throw on string delimiters that are invalid regex patterns", async () => {
  await type("one+two+", q.textbox("Plus tags"));
  expect(q.text("Plus tags values: one, two")).toBeVisible();
});

test("does not freeze on string delimiters that match empty regexes", async () => {
  await type("one|two|", q.textbox("Pipe tags"));
  expect(q.text("Pipe tags values: one, two")).toBeVisible();
});
