import * as Core from "@ariakit/core/disclosure/disclosure-store";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useDisclosureStoreProps<T extends Core.DisclosureStore>(
  store: T,
  update: () => void,
  props: DisclosureStoreProps,
) {
  useUpdateEffect(update, [props.store, props.disclosure]);
  useStoreProps(store, props, "open", "setOpen");
  useStoreProps(store, props, "mounted", "setMounted");
  useStoreProps(store, props, "animated");
  return store;
}

/**
 * Creates a disclosure store to control the state of
 * [Disclosure](https://ariakit.org/components/disclosure) components.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureStore();
 *
 * <Disclosure store={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent store={disclosure}>Content</DisclosureContent>
 * ```
 */
export function useDisclosureStore(
  props: DisclosureStoreProps = {},
): DisclosureStore {
  const [store, update] = useStore(Core.createDisclosureStore, props);
  return useDisclosureStoreProps(store, update, props);
}

export interface DisclosureStoreState extends Core.DisclosureStoreState {}

export interface DisclosureStoreFunctions
  extends Core.DisclosureStoreFunctions {}

export interface DisclosureStoreOptions extends Core.DisclosureStoreOptions {
  /**
   * A callback that gets called when the
   * [`open`](https://ariakit.org/reference/disclosure-provider#open) state
   * changes.
   * @example
   * const [open, setOpen] = useState(false);
   * const disclosure = useDisclosureStore({ open, setOpen });
   */
  setOpen?: (open: DisclosureStoreState["open"]) => void;
  /**
   * A callback that gets called when the `mounted` state changes.
   * @example
   * const [mounted, setMounted] = useState(false);
   * const disclosure = useDisclosureStore({ setMounted });
   */
  setMounted?: (mounted: DisclosureStoreState["mounted"]) => void;
}

export interface DisclosureStoreProps
  extends DisclosureStoreOptions,
    Core.DisclosureStoreProps {}

export interface DisclosureStore
  extends DisclosureStoreFunctions,
    Store<Core.DisclosureStore> {}
