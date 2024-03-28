import type { ReactNode } from "react";
import { TooltipContextProvider } from "./tooltip-context.tsx";
import { useTooltipStore } from "./tooltip-store.ts";
import type { TooltipStoreProps } from "./tooltip-store.ts";

/**
 * Provides a tooltip store to [Tooltip](https://ariakit.org/components/tooltip)
 * components.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * <TooltipProvider timeout={250}>
 *   <TooltipAnchor />
 *   <Tooltip />
 * </TooltipProvider>
 * ```
 */
export function TooltipProvider(props: TooltipProviderProps = {}) {
  const store = useTooltipStore(props);
  return (
    <TooltipContextProvider value={store}>
      {props.children}
    </TooltipContextProvider>
  );
}

export interface TooltipProviderProps extends TooltipStoreProps {
  children?: ReactNode;
}
