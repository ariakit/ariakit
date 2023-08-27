import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { DisclosureStore } from "./disclosure-store.js";

export const DisclosureContext = createContext<DisclosureStore | undefined>(
  undefined,
);

/**
 * Returns the disclosure store from the nearest disclosure container.
 * @example
 * function Disclosure() {
 *   const store = useDisclosureContext();
 *
 *   if (!store) {
 *     throw new Error("Disclosure must be wrapped in DisclosureProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useDisclosureContext() {
  return useContext(DisclosureContext);
}

export function DisclosureContextProvider(
  props: ComponentPropsWithoutRef<typeof DisclosureContext.Provider>,
) {
  return <DisclosureContext.Provider {...props} />;
}
