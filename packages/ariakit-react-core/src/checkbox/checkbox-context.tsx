import { createStoreContext } from "../utils/system.js";
import type { CheckboxStore } from "./checkbox-store.js";

const ctx = createStoreContext<CheckboxStore>();

/**
 * Returns the checkbox store from the nearest checkbox container.
 * @example
 * function Checkbox() {
 *   const store = useCheckboxContext();
 *
 *   if (!store) {
 *     throw new Error("Checkbox must be wrapped in CheckboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useCheckboxContext = ctx.useStoreContext;

export const useCheckboxScopedContext = ctx.useScopedStoreContext;

export const useCheckboxProviderContext = ctx.useStoreProviderContext;

export const CheckboxContextProvider = ctx.StoreContextProvider;

export const CheckboxScopedContextProvider = ctx.StoreScopedContextProvider;
