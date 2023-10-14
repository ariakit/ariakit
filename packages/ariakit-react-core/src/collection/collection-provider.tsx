"use client";
import type { ReactElement, ReactNode } from "react";
import type { PickRequired } from "@ariakit/core/utils/types";
import { CollectionContextProvider } from "./collection-context.js";
import { useCollectionStore } from "./collection-store.js";
import type {
  CollectionStoreItem,
  CollectionStoreProps,
} from "./collection-store.js";

type Item = CollectionStoreItem;

/**
 * Provides a collection store to CollectionItem components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * <CollectionProvider>
 *   <CollectionItem />
 *   <CollectionItem />
 *   <CollectionItem />
 * </CollectionProvider>
 * ```
 */

export function CollectionProvider<T extends Item = Item>(
  props: PickRequired<CollectionProviderProps<T>, "items" | "defaultItems">,
): ReactElement;

export function CollectionProvider(
  props?: CollectionProviderProps,
): ReactElement;

export function CollectionProvider(props: CollectionProviderProps = {}) {
  const store = useCollectionStore(props);
  return (
    <CollectionContextProvider value={store}>
      {props.children}
    </CollectionContextProvider>
  );
}

export interface CollectionProviderProps<T extends Item = Item>
  extends CollectionStoreProps<T> {
  children?: ReactNode;
}
