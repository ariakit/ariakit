import type { DependencyList } from "react";
import * as Core from "@ariakit/core/disclosure/disclosure-store";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useDisclosureStoreProps<T extends Core.DisclosureStore>(
  store: T,
  update: () => void,
  props: DisclosureStoreProps,
  deps: DependencyList = [],
) {
  useUpdateEffect(update, [props.store, props.disclosure, ...deps]);
  useStoreProps(store, props, "open", "setOpen");
  useStoreProps(store, props, "animated");
  return store;
}

/**
 * Creates a disclosure store.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureState();
 * <Disclosure state={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent state={disclosure}>Content</DisclosureContent>
 * ```
 */
export function useDisclosureStore(
  props: DisclosureStoreProps = {},
): DisclosureStore {
  const [store, update] = useStore(Core.createDisclosureStore, props);
  return useDisclosureStoreProps(store, update, props);
}

export type DisclosureStoreState = Core.DisclosureStoreState;

export type DisclosureStoreFunctions = Core.DisclosureStoreFunctions;

export interface DisclosureStoreOptions extends Core.DisclosureStoreOptions {
  /**
   * A callback that gets called when the `open` state changes.
   * @param open The new open value.
   * @example
   * const [open, setOpen] = useState(false);
   * const disclosure = useDisclosureStore({ open, setOpen });
   */
  setOpen?: (open: DisclosureStoreState["open"]) => void;
}

export type DisclosureStoreProps = DisclosureStoreOptions &
  Core.DisclosureStoreProps;

export type DisclosureStore = DisclosureStoreFunctions &
  Store<Core.DisclosureStore>;
