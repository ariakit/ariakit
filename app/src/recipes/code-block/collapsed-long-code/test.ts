import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("collapsed code is not a tab stop", async () => {
  expect(document.querySelector("pre")).toHaveAttribute("tabindex", "-1");
  expect(q.button("Show all 36 lines")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  // The code comes first, so the first tab stop skips it.
  await press.Tab();
  expect(q.button("Show all 36 lines")).toHaveFocus();
  await press.Tab();
  expect(q.button("Copy use-users.ts")).toHaveFocus();
});

test("moves the focus to the code that the buttons control", async () => {
  const code = document.querySelector("pre");
  expect(q.button("Show all 36 lines")).toHaveAttribute(
    "aria-controls",
    code?.id,
  );
  await click(q.button("Show all 36 lines"));
  expect(q.region("use-users.ts")).toHaveFocus();
  expect(q.button("Show fewer lines")).toHaveAttribute("aria-expanded", "true");
  expect(q.button("Show fewer lines")).toHaveAttribute(
    "aria-controls",
    code?.id,
  );
});

test("puts the collapse button right after the expanded code", async () => {
  await click(q.button("Show all 36 lines"));
  await press.Tab();
  expect(q.button("Show fewer lines")).toHaveFocus();
  await press.Tab();
  expect(q.button("Copy use-users.ts")).toHaveFocus();
});

test("collapses with the button below the code", async () => {
  await click(q.button("Show all 36 lines"));
  await click(q.button("Show fewer lines"));
  expect(q.button("Show all 36 lines")).toHaveFocus();
  expect(q.button.maybe("Show fewer lines")).not.toBeInTheDocument();
});

test("copies the whole file while collapsed", async () => {
  await click(q.button("Copy use-users.ts"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied.split("\n")).toHaveLength(36);
});
