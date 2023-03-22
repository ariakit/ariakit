import * as Core from "@ariakit/core/disclosure/disclosure-store";
import { Store, useStore, useStoreProps } from "../utils/store.js";

export function useDisclosureStoreOptions(
  _props: DisclosureStoreProps
): Partial<DisclosureStoreOptions> {
  return {};
}

export function useDisclosureStoreProps<T extends DisclosureStore>(
  store: T,
  props: DisclosureStoreProps
) {
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
  props: DisclosureStoreProps = {}
): DisclosureStore {
  const options = useDisclosureStoreOptions(props);
  const store = useStore(() =>
    Core.createDisclosureStore({ ...props, ...options })
  );
  return useDisclosureStoreProps(store, props);
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
