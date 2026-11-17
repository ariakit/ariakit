import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows and hides the password with the same button", async () => {
  expect(q.labeled("Password")).toHaveAttribute("type", "password");
  expect(q.button("Show password")).toHaveAttribute("aria-pressed", "false");
  await click(q.button("Show password"));
  expect(q.button("Show password")).toHaveAttribute("aria-pressed", "true");
  expect(q.labeled("Password")).toHaveAttribute("type", "text");
  expect(q.labeled("Password")).toHaveValue("correct horse battery");
  expect(q.labeled("Password")).toHaveAccessibleDescription(
    "Use at least 12 characters.",
  );
  await click(q.button("Show password"));
  expect(q.labeled("Password")).toHaveAttribute("type", "password");
});
