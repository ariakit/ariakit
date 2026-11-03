import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps the values of each form when the tab changes", async () => {
  await click(q.within(q.tabpanel("Sign in")).textbox("Email"));
  await type("sam@example.com");
  await click(q.tab("Sign up"));
  await click(q.within(q.tabpanel("Sign up")).textbox("Name"));
  await type("Sam");

  await click(q.tab("Sign in"));
  expect(q.within(q.tabpanel("Sign in")).textbox("Email")).toHaveValue(
    "sam@example.com",
  );
  await click(q.tab("Sign up"));
  expect(q.within(q.tabpanel("Sign up")).textbox("Name")).toHaveValue("Sam");
  expect(q.within(q.tabpanel("Sign up")).textbox("Email")).toHaveValue("");
});
