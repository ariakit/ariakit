// See https://github.com/ariakit/ariakit/issues/6339
import { click, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test("backdrop fades out on close when only the backdrop is animated", async () => {
  await click(q.button("Show dialog"));
  expect(q.dialog()).toBeVisible();
  const backdrop = q.presentation.ensure();
  // The enter state is applied after a couple of frames.
  await expect.poll(() => backdrop.getAttribute("data-enter")).toBe("true");
  // The Close button is auto-focused when the dialog opens.
  expect(q.button("Close")).toHaveFocus();
  await click(q.button("Close"));
  // Focus returns to the disclosure as soon as the dialog closes, so a failure
  // below unambiguously points at the backdrop leave transition.
  expect(q.button("Show dialog")).toHaveFocus();
  // On close, the backdrop must receive data-leave and remain visible while
  // its 500ms exit transition runs. Before the fix, the dialog hides instantly
  // and data-leave is never applied.
  await expect.poll(() => backdrop.getAttribute("data-leave")).toBe("true");
  expect(backdrop).not.toHaveStyle("display: none");
  // After the transition ends, the backdrop hides.
  await expect.poll(() => backdrop.style.display).toBe("none");
});

test("backdrop finishes its longer fade out when the panel has a shorter transition", async () => {
  await click(q.button("Show fast dialog"));
  expect(q.dialog()).toBeVisible();
  const backdrop = q.presentation.ensure();
  // The enter state is applied after a couple of frames.
  await expect.poll(() => backdrop.getAttribute("data-enter")).toBe("true");
  // The Close button is auto-focused when the dialog opens.
  expect(q.button("Close")).toHaveFocus();
  await click(q.button("Close"));
  // Focus returns to the disclosure as soon as the dialog closes.
  expect(q.button("Show fast dialog")).toHaveFocus();
  await expect.poll(() => backdrop.getAttribute("data-leave")).toBe("true");
  // Wait past the panel's 150ms transition. The backdrop must keep leaving
  // until its own 500ms transition ends. Before the fix, the panel's shorter
  // timeout stopped the shared animation state, hiding the backdrop at 150ms.
  await sleep(250);
  expect(backdrop).toHaveAttribute("data-leave", "true");
  expect(backdrop).not.toHaveStyle("display: none");
  // After the backdrop's transition ends, it hides.
  await expect.poll(() => backdrop.style.display).toBe("none");
});
