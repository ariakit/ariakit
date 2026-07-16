import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createDisclosureStore } from "./disclosure-store.ts";

test("updates a standalone store", () => {
  const store = createDisclosureStore();
  const stop = init(store);

  try {
    store.show();
    expect(store.getState().open).toBe(true);
    expect(store.getState().mounted).toBe(true);

    store.hide();
    expect(store.getState().open).toBe(false);
    expect(store.getState().mounted).toBe(false);
  } finally {
    stop();
  }
});

test("syncs with a disclosure store", () => {
  const disclosure = createDisclosureStore({ defaultOpen: true });
  const store = createDisclosureStore({ disclosure });
  const stop = init(store);

  try {
    expect(store.getState().open).toBe(true);

    disclosure.hide();
    expect(store.getState().open).toBe(false);
  } finally {
    stop();
  }
});
