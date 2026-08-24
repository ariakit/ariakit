import * as Ariakit from "@ariakit/react";
import { click, q } from "@ariakit/test";
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

function createDefaultMultipleSelectList() {
  return createElement<Ariakit.SelectProviderProps<string[]>>(
    Ariakit.SelectProvider,
    { defaultValue: ["Apple"] },
    createElement(Ariakit.SelectList, {
      "aria-label": "Server multiple list",
      alwaysVisible: true,
    }),
  );
}

// https://github.com/ariakit/ariakit/issues/7114
test("renders default multiple SelectList semantics on the server", () => {
  const container = document.createElement("div");
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    container.innerHTML = renderToString(createDefaultMultipleSelectList());
    const unexpectedServerErrors = consoleError.mock.calls.filter(
      ([message]) =>
        !String(message).includes("useLayoutEffect does nothing on the server"),
    );
    expect(unexpectedServerErrors).toEqual([]);

    const list = q.within(container).listbox("Server multiple list");
    expect(list).toHaveAttribute("role", "listbox");
    expect(list).toHaveAttribute("aria-multiselectable", "true");
  } finally {
    consoleError.mockRestore();
  }
});

// https://github.com/ariakit/ariakit/issues/7114
test("hydrates default multiple SelectList semantics and tracks its live role", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createDefaultMultipleSelectList();
  const container = document.createElement("div");
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    container.innerHTML = renderToString(element);
    consoleError.mockClear();
    document.body.appendChild(container);

    const list = q.within(container).listbox("Server multiple list");
    expect(list).toHaveAttribute("aria-multiselectable", "true");

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(list).toHaveAttribute("aria-multiselectable", "true");

    await act(async () => {
      list.setAttribute("role", "menu");
    });
    expect(list).not.toHaveAttribute("aria-multiselectable");

    await act(async () => {
      list.setAttribute("role", "grid");
    });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
  } finally {
    consoleError.mockRestore();
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});

describe.each([
  ["public-combobox-multiple-select", "Provider multiple legacy fruits"],
  ["public-combobox-multiple-store", "Store multiple legacy fruits"],
])("%s aria-multiselectable", (caseName, label) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("supports the live listbox role from render composition", async () => {
    await click(q.combobox(label));
    expect(q.listbox()).toHaveAttribute("aria-multiselectable", "true");
  });
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps an unregistered multi-value SelectItem clickable", async () => {
  await click(q.button("Show public-select-multiple-unregistered"));
  const item = q.option("Cake");
  expect(item).toHaveAttribute("aria-selected", "false");
  await click(item);
  expect(item).toHaveAttribute("aria-selected", "true");
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps an unregistered multi-value ComboboxItem clickable", async () => {
  await click(q.button("Show public-combobox-multiple-unregistered"));
  const item = q.option("Cake");
  expect(item).toHaveAttribute("aria-selected", "false");
  await click(item);
  expect(item).toHaveAttribute("aria-selected", "true");
});
