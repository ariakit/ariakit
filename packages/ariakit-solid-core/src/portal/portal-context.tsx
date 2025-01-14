import { createContext } from "solid-js";

/**
 * Stores the element that will contain the portal. By default, it will be the
 * body of the document.
 * @example
 * ```jsx
 * const container = document.getElementById("container");
 *
 * function App() {
 *   return (
 *     <PortalContext.Provider value={container}>
 *       <Portal />
 *     </PortalContext.Provider>
 *   );
 * }
 * ```
 */
// TODO: probably should be () => HTMLElement | undefined
// or MaybeAccessor<HTMLElement | undefined>
export const PortalContext = createContext<HTMLElement>();
