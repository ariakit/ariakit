import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("detaches portalRef before removing the node when the portal prop is toggled off", async () => {
  expect(q.text("Portal content")).toBeVisible();

  await click(q.button("Disable portal"));
  // The content is rendered in place once the portal is disabled, and the
  // portalRef cleanup must have run while the node was still in the DOM.
  expect(q.text("Portal content")).toBeVisible();
  expect(q.text("Portal cleanup connected: yes")).toBeVisible();
});

test("does not attach an inline portalRef to the removed node when the portal prop is toggled off", async () => {
  expect(q.text("Inline portal content")).toBeVisible();
  expect(q.text("Inline portal attach connected: yes")).toBeVisible();

  await click(q.button("Disable inline portal"));
  // The content is rendered in place once the portal is disabled, and the
  // new inline portalRef must not have fired against the removed node.
  expect(q.text("Inline portal content")).toBeVisible();
  expect(q.text("Inline portal attach connected: yes")).toBeVisible();
});
