import type { ReactNode } from "react";
import { ToolbarContextProvider } from "./toolbar-context.js";
import { useToolbarStore } from "./toolbar-store.js";
import type { ToolbarStoreProps } from "./toolbar-store.js";

/**
 * Provides a toolbar store to [Toolbar](https://ariakit.org/components/toolbar)
 * components.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * <ToolbarProvider>
 *   <Toolbar>
 *     <ToolbarItem />
 *     <ToolbarItem />
 *     <ToolbarItem />
 *   </Toolbar>
 * </ToolbarProvider>
 * ```
 */
export function ToolbarProvider(props: ToolbarProviderProps = {}) {
  const store = useToolbarStore(props);
  return (
    <ToolbarContextProvider value={store}>
      {props.children}
    </ToolbarContextProvider>
  );
}

export interface ToolbarProviderProps extends ToolbarStoreProps {
  children?: ReactNode;
}
