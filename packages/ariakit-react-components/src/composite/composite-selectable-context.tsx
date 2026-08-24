import { createStoreContext } from "@ariakit/react-utils";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "./composite-context.tsx";
import type { CompositeSelectableStore } from "./composite-selectable-store.ts";

const ctx = createStoreContext<CompositeSelectableStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
);

/** Returns the selectable composite store from the nearest provider. */
export const useCompositeSelectableContext = ctx.useContext;

export const useCompositeSelectableScopedContext = ctx.useScopedContext;

export const useCompositeSelectableProviderContext = ctx.useProviderContext;

export const CompositeSelectableContextProvider = ctx.ContextProvider;

export const CompositeSelectableScopedContextProvider =
  ctx.ScopedContextProvider;
