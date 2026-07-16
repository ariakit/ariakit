import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The controlled animated option re-asserts true after enter detection finds
// no CSS animation and turns the animated state off. Closing must still stop
// the animation and unmount the content in that case. Browser duplicate in
// test-browser.ts.
test("closes content with a truthy animated option and no CSS animation", async () => {
  const toggle = () => click(q.button("Toggle Boolean animated"));

  expect(q.text("Boolean animated content")).not.toBeInTheDocument();

  await toggle();
  expect(q.text("Boolean animated content")).toBeVisible();

  await toggle();
  expect(q.text("Boolean animated content")).not.toBeInTheDocument();

  await toggle();
  expect(q.text("Boolean animated content")).toBeVisible();
});

// Re-enabling animations at runtime must not resurface the enter state from
// a previous open on closed content that stays visible (alwaysVisible), not
// even transiently, so attribute mutations are recorded instead of sampling
// the final state. Browser duplicate in test-browser.ts.
test("keeps stale data-enter off visible closed content when animations are re-enabled", async () => {
  const content = () => q.text.ensure("Always visible content");
  const toggle = () => click(q.button("Toggle Always visible"));

  expect(content()).toBeVisible();
  await toggle();
  expect(content()).toHaveAttribute("data-enter");
  await toggle();
  expect(content()).not.toHaveAttribute("data-enter");

  let enterAppeared = false;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName !== "data-enter") continue;
      if (!(mutation.target as Element).hasAttribute("data-enter")) continue;
      enterAppeared = true;
    }
  });
  observer.observe(content(), { attributes: true });
  await click(q.button("Animate Always visible"));
  observer.disconnect();
  expect(enterAppeared).toBe(false);
  expect(content()).not.toHaveAttribute("data-enter");

  // The re-enabled animation must actually work on the next toggle.
  await toggle();
  expect(content()).toHaveAttribute("data-enter");
});
