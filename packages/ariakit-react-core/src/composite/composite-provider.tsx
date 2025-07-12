import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import { CompositeContextProvider } from "./composite-context.tsx";
import type {
  CompositeStoreItem,
  CompositeStoreProps,
} from "./composite-store.ts";
import { useCompositeStore } from "./composite-store.ts";

/**
 * Provides a composite store to
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) components.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem />
 *     <CompositeItem />
 *     <CompositeItem />
 *   </Composite>
 * </CompositeProvider>
 * ```
 */

export function CompositeProvider<
  T extends CompositeStoreItem = CompositeStoreItem,
>(
  props: PickRequired<CompositeProviderProps<T>, "items" | "defaultItems">,
): ReactElement;

export function CompositeProvider(props?: CompositeProviderProps): ReactElement;

export function CompositeProvider(props: CompositeProviderProps = {}) {
  const store = useCompositeStore(props);
  return (
    <CompositeContextProvider value={store}>
      {props.children}
    </CompositeContextProvider>
  );
}

export interface CompositeProviderProps<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreProps<T> {
  children?: ReactNode;
}
