import { click, hover, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

// Queries the content and the portal element of the shadow root.
function queryShadowRoot(name: string) {
  const host = document.querySelector(`[data-shadow-host="${name}"]`);
  const shadow = host?.shadowRoot;
  return {
    root: shadow,
    content: q.within(
      shadow?.querySelector<HTMLElement>("[data-shadow-container]"),
    ),
    portal: q.within(
      shadow?.querySelector<HTMLElement>("[data-shadow-portal]"),
    ),
  };
}

// The document sees focus in a shadow root as focus on the shadow host, so this
// reads the focused element from the shadow root.
function expectFocusIn(root: ShadowRoot | null | undefined, element: Element) {
  expect(root?.activeElement).toBe(element);
}

async function hoverOutside() {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
}

// https://github.com/ariakit/ariakit/issues/8366
test("keep the hovercard in a shadow root open on mouse leave while focus is inside it", async () => {
  const { root, content } = queryShadowRoot("profile");
  await hover(content.link("Profile"));
  await expect.poll(() => content.dialog.maybe("Profile")).toBeVisible();
  await click(content.button("Follow"));
  expectFocusIn(root, content.button("Follow"));

  await hoverOutside();
  // Wait past the hide timeout to see that no hide runs.
  await sleep(hideTimeout + 100);

  expect(content.dialog("Profile")).toBeVisible();
  expectFocusIn(root, content.button("Follow"));
});

// https://github.com/ariakit/ariakit/issues/8366
test("keep a nested hovercard in a shadow root open on mouse leave while focus is inside it", async () => {
  const { root, content, portal } = queryShadowRoot("team");
  await hover(content.link("Team"));
  await expect.poll(() => content.dialog.maybe("Team")).toBeVisible();
  await hover(content.link("Member"));
  await expect.poll(() => portal.dialog.maybe("Member")).toBeVisible();
  await click(portal.button("Message"));
  expectFocusIn(root, portal.button("Message"));

  await hoverOutside();
  // Wait past the hide timeout to see that no hide runs.
  await sleep(hideTimeout + 100);

  expect(content.dialog("Team")).toBeVisible();
  expect(portal.dialog("Member")).toBeVisible();
  expectFocusIn(root, portal.button("Message"));
});

// https://github.com/ariakit/ariakit/issues/8366
test("hide the hovercard in a shadow root on mouse leave without focus inside it", async () => {
  const { content } = queryShadowRoot("profile");
  await hover(content.link("Profile"));
  await expect.poll(() => content.dialog.maybe("Profile")).toBeVisible();
  await hover(content.button("Follow"));

  await hoverOutside();

  await expect
    .poll(() => content.dialog.maybe("Profile"))
    .not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/8366
test("hide the nested hovercards in a shadow root on mouse leave without focus inside them", async () => {
  const { content, portal } = queryShadowRoot("team");
  await hover(content.link("Team"));
  await expect.poll(() => content.dialog.maybe("Team")).toBeVisible();
  await hover(content.link("Member"));
  await expect.poll(() => portal.dialog.maybe("Member")).toBeVisible();
  await hover(portal.button("Message"));

  await hoverOutside();

  await expect
    .poll(() => portal.dialog.maybe("Member"))
    .not.toBeInTheDocument();
  await expect.poll(() => content.dialog.maybe("Team")).not.toBeInTheDocument();
});
