import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { expect, test } from "vitest";
import { Button, ButtonSlot } from "./button.solid.tsx";

// Regression coverage: the disabled state and the slot kind were read once
// at setup, so post-mount updates changed the native attributes but froze
// the variant-driven output at its mount value.
test("updates the disabled variant when disabled changes", () => {
  const [disabled, setDisabled] = createSignal(false);
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(
    () => <Button disabled={disabled()}>Label</Button>,
    container,
  );
  const button = container.querySelector("button");
  expect(button?.classList.contains("disabled")).toBe(false);
  setDisabled(true);
  expect(button?.disabled).toBe(true);
  expect(button?.classList.contains("disabled")).toBe(true);
  dispose();
  container.remove();
});

test("updates the badge slot wrapper when $kind changes", () => {
  const [kind, setKind] = createSignal<"icon" | "badge">("icon");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(
    () => <ButtonSlot $kind={kind()}>Label</ButtonSlot>,
    container,
  );
  const slot = container.querySelector("span");
  // The badge kind wraps the children in a span so they are styled
  // correctly; other kinds render them directly.
  expect(slot?.firstElementChild).toBeNull();
  setKind("badge");
  expect(slot?.firstElementChild?.tagName).toBe("SPAN");
  dispose();
  container.remove();
});
