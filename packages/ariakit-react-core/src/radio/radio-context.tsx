import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import { createStoreContext } from "../utils/system.js";
import type { RadioStore } from "./radio-store.js";

const ctx = createStoreContext<RadioStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
);

/**
 * Returns the radio store from the nearest radio container.
 * @example
 * function Radio() {
 *   const store = useRadioContext();
 *
 *   if (!store) {
 *     throw new Error("Radio must be wrapped in RadioProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useRadioContext = ctx.useContext;

export const useRadioScopedContext = ctx.useScopedContext;

export const useRadioProviderContext = ctx.useProviderContext;

export const RadioContextProvider = ctx.ContextProvider;

export const RadioScopedContextProvider = ctx.ScopedContextProvider;
