import { click, focus, press, q, rightClick } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps the frontmost initially open sibling dialog interactive", async () => {
  expect(q.dialog.all.hidden()).toHaveLength(2);
  expect(q.dialog.hidden("Apples")).toBeVisible();
  expect(q.dialog.hidden("Oranges")).toBeVisible();
  expect(q.dialog("Oranges")).not.toBeInTheDocument();
  expect(q.dialog("Apples")).toBeVisible();

  await click(q.button("Eat apple"));
  expect(q.status("Apple count")).toHaveTextContent("Apples eaten: 1");
  expect(q.dialog("Oranges")).not.toBeInTheDocument();
  expect(q.dialog("Apples")).toBeVisible();

  await rightClick(document.querySelector("[data-testid=apples-backdrop]"), {
    clientX: 10,
    clientY: 10,
  });
  expect(q.dialog("Apples")).not.toBeInTheDocument();
  expect(q.dialog("Oranges")).toBeVisible();
  await click(q.button("Eat orange"));
  expect(q.status("Orange count")).toHaveTextContent("Oranges eaten: 1");
});

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps initially open sibling dialogs interactive in a shadow root", async () => {
  await click(q.button("Render dialogs in shadow root"));

  const host = document.querySelector<HTMLElement>(
    "[data-testid=dialog-shadow-host]",
  );
  const portal = host?.shadowRoot?.querySelector<HTMLElement>(
    "[data-dialog-shadow-portal]",
  );
  const shadowQ = q.within(portal);
  const orangesDialog = shadowQ.dialog.ensure.hidden("Oranges");
  const applesDialog = shadowQ.dialog.ensure.hidden("Apples");

  expect(applesDialog.getRootNode()).toBe(host?.shadowRoot);
  expect(shadowQ.dialog.all.hidden()).toHaveLength(2);
  expect(orangesDialog.closest("[inert]")).toBeTruthy();
  expect(applesDialog.closest("[inert]")).toBeNull();

  const eatApple = shadowQ.button("Eat apple");
  const closeApples = shadowQ.button("Close apples");

  await focus(closeApples);
  expect(host?.shadowRoot?.activeElement).toBe(closeApples);
  // document.activeElement is the shadow host, so target the deep active
  // element when pressing at each dialog boundary.
  await press.Tab(closeApples);
  expect(host?.shadowRoot?.activeElement).toBe(eatApple);

  await focus(eatApple);
  await press.ShiftTab(eatApple);
  expect(host?.shadowRoot?.activeElement).toBe(closeApples);

  await click(eatApple);
  expect(shadowQ.status("Apple count")).toHaveTextContent("Apples eaten: 1");

  await rightClick(
    portal?.querySelector("[data-testid=apples-backdrop]") || null,
    { clientX: 10, clientY: 10 },
  );
  expect(shadowQ.dialog("Apples")).not.toBeInTheDocument();
  expect(orangesDialog.closest("[inert]")).toBeNull();

  await click(shadowQ.button("Eat orange"));
  expect(shadowQ.status("Orange count")).toHaveTextContent("Oranges eaten: 1");
});
