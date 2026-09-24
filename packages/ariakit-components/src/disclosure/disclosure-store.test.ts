import { init, subscribe } from "@ariakit/store";
import { expect, test, vi } from "vitest";
import { createDisclosureStore } from "./disclosure-store.ts";

test("updates a standalone store", () => {
  const store = createDisclosureStore();
  const stop = init(store);

  store.show();
  expect(store.getState().open).toBe(true);
  expect(store.getState().mounted).toBe(true);

  store.hide();
  expect(store.getState().open).toBe(false);
  expect(store.getState().mounted).toBe(false);
  stop();
});

test("syncs with a disclosure store", () => {
  const disclosure = createDisclosureStore({ defaultOpen: true });
  const store = createDisclosureStore({ disclosure });
  const stop = init(store);

  expect(store.getState().open).toBe(true);

  disclosure.hide();
  expect(store.getState().open).toBe(false);
  stop();
});

// https://github.com/ariakit/ariakit/issues/7616
test("a rejected hide request doesn't change the open state", () => {
  const parent = createDisclosureStore({ defaultOpen: true });
  const store = createDisclosureStore({ store: parent });
  const stop = init(store);
  const openChanges: boolean[] = [];
  const unsubscribe = subscribe(parent, ["open"], (state) => {
    openChanges.push(state.open);
  });
  let canHide = false;
  const handler = vi.fn((hide: () => void) => {
    if (!canHide) return;
    hide();
  });
  // Registering on the extending store also covers requests on the parent, like
  // a Dialog store that extends the store of a combobox.
  const unregister = store.unstable_onHideRequest(handler);

  parent.hide();
  parent.toggle();
  parent.setOpen(false);
  store.hide();
  expect(handler).toHaveBeenCalledTimes(4);
  expect(openChanges).toEqual([]);
  expect(store.getState().open).toBe(true);

  canHide = true;
  parent.hide();
  expect(handler).toHaveBeenCalledTimes(5);
  expect(openChanges).toEqual([false]);
  expect(store.getState().open).toBe(false);

  unregister();
  parent.show();
  parent.hide();
  expect(handler).toHaveBeenCalledTimes(5);
  expect(openChanges).toEqual([false, true, false]);

  unsubscribe();
  stop();
});

// https://github.com/ariakit/ariakit/issues/7616
test("a hide request on a sibling store runs the handler", () => {
  const parent = createDisclosureStore({ defaultOpen: true });
  // Like a Dialog store and the store of a disclosure button that both extend
  // the store an app passes to them.
  const dialog = createDisclosureStore({ store: parent });
  const sibling = createDisclosureStore({ store: parent });
  const stopDialog = init(dialog);
  const stopSibling = init(sibling);
  const handler = vi.fn();
  const unregister = dialog.unstable_onHideRequest(handler);

  sibling.hide();
  sibling.toggle();
  expect(handler).toHaveBeenCalledTimes(2);
  expect(parent.getState().open).toBe(true);
  expect(dialog.getState().open).toBe(true);
  expect(sibling.getState().open).toBe(true);

  unregister();
  stopSibling();
  stopDialog();
});

// https://github.com/ariakit/ariakit/issues/7616
test("a later hide handler can reject a request that an earlier one allows", () => {
  const store = createDisclosureStore({ defaultOpen: true });
  const stop = init(store);
  const openChanges: boolean[] = [];
  const unsubscribe = subscribe(store, ["open"], (state) => {
    openChanges.push(state.open);
  });
  const calls: string[] = [];
  let canHide = false;
  const unregisterFirst = store.unstable_onHideRequest((hide) => {
    calls.push("first");
    hide();
  });
  const unregisterSecond = store.unstable_onHideRequest((hide) => {
    calls.push("second");
    if (!canHide) return;
    hide();
  });

  store.hide();
  expect(calls).toEqual(["first", "second"]);
  expect(openChanges).toEqual([]);

  canHide = true;
  store.hide();
  expect(calls).toEqual(["first", "second", "first", "second"]);
  expect(openChanges).toEqual([false]);

  unregisterSecond();
  unregisterFirst();
  unsubscribe();
  stop();
});
