import type { Store } from "@ariakit/store";
import type { DisclosureStoreFunctions } from "./disclosure-store.ts";

type HideRequestFunctions = Partial<
  Pick<
    DisclosureStoreFunctions,
    "unstable_onHideRequest" | "unstable_requestHide"
  >
>;

type HideRequestStore = Store & HideRequestFunctions;

/**
 * Returns the hide request functions of a store, if it has them.
 */
export function getHideRequest(store?: HideRequestStore | null) {
  const onHideRequest = store?.unstable_onHideRequest;
  const requestHide = store?.unstable_requestHide;
  if (!onHideRequest) return;
  if (!requestHide) return;
  return { onHideRequest, requestHide };
}

/**
 * Adds the hide request of a linked store to a store merged from it. A store
 * linked through `omit` shares the open state but not the functions of the
 * linked store, so without it, a hide request on the linked store, like a
 * combobox item hiding the combobox store, wouldn't run the hide handlers of a
 * Dialog that renders the other store. A hide request that the merged store
 * already has, like the one from the `store` option, takes precedence.
 */
export function withHideRequest<T extends Store>(
  store: T & HideRequestFunctions,
  linkedStore?: HideRequestStore | null,
): T {
  if (getHideRequest(store)) return store;
  const hideRequest = getHideRequest(linkedStore);
  if (!hideRequest) return store;
  return {
    ...store,
    unstable_onHideRequest: hideRequest.onHideRequest,
    unstable_requestHide: hideRequest.requestHide,
  };
}
