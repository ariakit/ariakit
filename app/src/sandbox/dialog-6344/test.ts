import { click, q, rightClick } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6344
test("stays open when interacting with a persistent element before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // The dialog hasn't been focused yet (autoFocusOnShow={false}). Clicking
  // the persistent field must not close it.
  await click(q.textbox("Notification field"));
  expect(q.textbox("Notification field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();

  // Other interactions with the persistent region must not close it either.
  await click(q.button("Dismiss notification"));
  expect(q.dialog("Dialog")).toBeVisible();
});

test("stays open on right-clicking a persistent element before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await rightClick(q.textbox("Notification field"));
  expect(q.dialog("Dialog")).toBeVisible();
});

test("keeps the documented behavior after the dialog has been focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // Focusing inside the dialog first is the documented, working path.
  await click(q.textbox("Inside field"));
  expect(q.textbox("Inside field")).toHaveFocus();

  await click(q.textbox("Notification field"));
  expect(q.textbox("Notification field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();
});

test("stays open when interacting with a persistent shadow element", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  const host = document.querySelector<HTMLElement>("[data-testid=shadow-host]");
  const persistentHost = host?.shadowRoot?.querySelector<HTMLElement>(
    "[data-persistent-shadow-host]",
  );
  const persistentInput =
    persistentHost?.shadowRoot?.querySelector<HTMLInputElement>(
      "[data-persistent-shadow-field]",
    );
  const persistentButton =
    persistentHost?.shadowRoot?.querySelector<HTMLButtonElement>(
      "[data-persistent-shadow-button]",
    );

  await click(persistentInput || null);
  expect(persistentHost?.shadowRoot?.activeElement).toBe(persistentInput);
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Inside field"));
  await click(persistentButton || null);
  expect(q.textbox("Inside field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();
});

test("ignores focus events from disconnected shadow elements", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  const host = document.querySelector<HTMLElement>("[data-testid=shadow-host]");
  const disconnectedInput = host?.shadowRoot?.querySelector<HTMLInputElement>(
    "[data-disconnected-shadow-field]",
  );
  if (!host || !disconnectedInput) {
    throw new Error("Missing disconnected shadow field");
  }
  disconnectedInput.focus();
  expect(disconnectedInput.isConnected).toBe(false);
  expect(q.dialog("Dialog")).toBeVisible();
});

test("still closes when interacting outside before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Outside field"));
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();
});

test("closes when interacting inside an unrelated shadow root", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Inside field"));
  const host = document.querySelector<HTMLElement>("[data-testid=shadow-host]");
  const outsideShadowField = host?.shadowRoot?.querySelector<HTMLInputElement>(
    "[data-outside-shadow-field]",
  );
  await click(outsideShadowField || null);
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();
});
