import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders detached content and removes it when unmounted", async () => {
  expect(q.text("Detached portal content")).toBeInTheDocument();

  await click(q.button("Toggle portal"));
  expect(q.text("Detached portal content")).not.toBeInTheDocument();

  await click(q.button("Toggle portal"));
  expect(q.text("Detached portal content")).toBeInTheDocument();
});

test("renders a lazy component through a portal", async () => {
  expect(await q.button.wait("Lazy portal button")).toBeInTheDocument();
});
