import type { ReactNode } from "react";
import {
  createHovercardProvider,
  HovercardContextProvider,
} from "./hovercard-context.tsx";
import type { HovercardStoreProps } from "./hovercard-store.ts";
import { useHovercardStore } from "./hovercard-store.ts";

/**
 * Provides a hovercard store to
 * [Hovercard](https://ariakit.com/components/hovercard) components.
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider timeout={250}>
 *   <HovercardAnchor />
 *   <Hovercard />
 * </HovercardProvider>
 * ```
 */
export const HovercardProvider = createHovercardProvider(
  function HovercardProvider(props: HovercardProviderProps = {}) {
    const store = useHovercardStore(props);
    return (
      <HovercardContextProvider value={store}>
        {props.children}
      </HovercardContextProvider>
    );
  },
);

export interface HovercardProviderProps extends HovercardStoreProps {
  children?: ReactNode;
}
