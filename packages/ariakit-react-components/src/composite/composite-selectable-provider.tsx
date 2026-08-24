import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import { CompositeSelectableContextProvider } from "./composite-selectable-context.tsx";
import type {
  CompositeSelectableStoreItem,
  CompositeSelectableStoreProps,
} from "./composite-selectable-store.ts";
import { useCompositeSelectableStore } from "./composite-selectable-store.ts";

/** Provides a selectable composite store to the components below it. */
export function CompositeSelectableProvider<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>(
  props: PickRequired<
    CompositeSelectableProviderProps<T>,
    "items" | "defaultItems"
  >,
): ReactElement;

export function CompositeSelectableProvider(
  props?: CompositeSelectableProviderProps,
): ReactElement;

export function CompositeSelectableProvider(
  props: CompositeSelectableProviderProps = {},
) {
  const store = useCompositeSelectableStore(props);
  return (
    <CompositeSelectableContextProvider value={store}>
      {props.children}
    </CompositeSelectableContextProvider>
  );
}

export interface CompositeSelectableProviderProps<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
> extends CompositeSelectableStoreProps<T> {
  children?: ReactNode;
}
