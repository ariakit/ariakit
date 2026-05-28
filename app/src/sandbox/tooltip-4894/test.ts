import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/4894
test("does not hide multiple controlled open tooltips", () => {
  expect(q.tooltip("HELLO!")).toBeVisible();
  expect(q.tooltip("HELLO 222!")).toBeVisible();
  expect(q.text("Close requests: 0")).toBeVisible();
});
