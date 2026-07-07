import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import {
  CompositeContextProvider,
  createCompositeProvider,
} from "./composite-context.tsx";
import type {
  CompositeStore,
  CompositeStoreItem,
  CompositeStoreProps,
} from "./composite-store.ts";
import { useCompositeStore } from "./composite-store.ts";

export interface CompositeProviderComponent extends ProviderComponent<CompositeStore> {
  <T extends CompositeStoreItem = CompositeStoreItem>(
    props: PickRequired<CompositeProviderProps<T>, "items" | "defaultItems">,
  ): ReactElement;
  (props?: CompositeProviderProps): ReactElement;
}

/**
 * Provides a composite store to
 * [`CompositeItem`](https://ariakit.com/reference/composite-item) components.
 * @see https://ariakit.com/components/composite
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
export const CompositeProvider: CompositeProviderComponent =
  createCompositeProvider(function CompositeProvider(
    props: CompositeProviderProps = {},
  ) {
    const store = useCompositeStore(props);
    return (
      <CompositeContextProvider value={store}>
        {props.children}
      </CompositeContextProvider>
    );
  });

export interface CompositeProviderProps<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreProps<T> {
  children?: ReactNode;
}
