import { hasFocusWithin } from "@ariakit/utils";
import { afterEach, expect, test } from "vitest";
import { hasNativeFocusWithin } from "./combobox-list-utils.ts";

afterEach(() => {
  document.body.replaceChildren();
});

test("does not treat aria-activedescendant as native focus within", () => {
  const baseElement = document.createElement("button");
  const contentElement = document.createElement("div");
  const itemElement = document.createElement("div");
  itemElement.id = "item";
  contentElement.append(itemElement);
  document.body.append(baseElement, contentElement);
  baseElement.setAttribute("aria-activedescendant", itemElement.id);
  baseElement.focus();

  expect(hasFocusWithin(contentElement)).toBe(true);
  expect(hasNativeFocusWithin(contentElement)).toBe(false);
});
