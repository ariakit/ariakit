import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the value of the field", async () => {
  await click(q.button("Copy link"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe(
    q.textbox("Invite link").getAttribute("value"),
  );
});
