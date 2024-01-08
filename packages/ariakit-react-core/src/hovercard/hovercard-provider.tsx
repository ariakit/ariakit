import type { ReactNode } from "react";
import { HovercardContextProvider } from "./hovercard-context.js";
import { useHovercardStore } from "./hovercard-store.js";
import type { HovercardStoreProps } from "./hovercard-store.js";

/**
 * Provides a hovercard store to
 * [Hovercard](https://ariakit.org/components/hovercard) components.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider timeout={250}>
 *   <HovercardAnchor />
 *   <Hovercard />
 * </HovercardProvider>
 * ```
 */
export function HovercardProvider(props: HovercardProviderProps = {}) {
  const store = useHovercardStore(props);
  return (
    <HovercardContextProvider value={store}>
      {props.children}
    </HovercardContextProvider>
  );
}

export interface HovercardProviderProps extends HovercardStoreProps {
  children?: ReactNode;
}
