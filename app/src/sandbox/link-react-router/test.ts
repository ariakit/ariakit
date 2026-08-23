import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("routes through a Link-owned native href", async () => {
  const previous = q.link("Previous entry");
  expect(previous).not.toHaveAttribute("href");
  expect(previous).toHaveAttribute("aria-disabled", "true");
  expect(previous).toHaveAttribute("tabindex", "0");

  await click(q.link("Next entry"));
  expect(q.status("Current route")).toHaveTextContent("/page/2");
  expect(previous).toHaveAttribute("href", "#/page/1");
  expect(q.link("Next entry")).toHaveAttribute("href", "#/page/3");
});

test("keeps the focused anchor mounted across route changes", async () => {
  const previous = q.link("Previous entry");
  const wasDisabled = !previous.hasAttribute("href");
  await click(q.button("Move route with previous focused"));
  expect(q.link("Previous entry")).toBe(previous);
  expect(previous).toHaveFocus();
  if (wasDisabled) {
    expect(previous).toHaveAttribute("href", "#/page/1");
  } else {
    expect(previous).not.toHaveAttribute("href");
  }
});

test("respects a consumer that prevents navigation", async () => {
  const route = q.status("Current route").textContent;
  await click(q.link("Try guarded navigation"));
  expect(q.status("Navigation guard")).toHaveTextContent(
    "The consumer kept this route in place.",
  );
  expect(q.status("Current route")).toHaveTextContent(route || "");
});
