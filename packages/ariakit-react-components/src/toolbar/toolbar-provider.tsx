import type { ReactNode } from "react";
import {
  createToolbarProvider,
  ToolbarContextProvider,
} from "./toolbar-context.tsx";
import type { ToolbarStoreProps } from "./toolbar-store.ts";
import { useToolbarStore } from "./toolbar-store.ts";

/**
 * Provides a toolbar store to [Toolbar](https://ariakit.com/components/toolbar)
 * components.
 * @see https://ariakit.com/components/toolbar
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
export const ToolbarProvider = createToolbarProvider(function ToolbarProvider(
  props: ToolbarProviderProps = {},
) {
  const store = useToolbarStore(props);
  return (
    <ToolbarContextProvider value={store}>
      {props.children}
    </ToolbarContextProvider>
  );
});

export interface ToolbarProviderProps extends ToolbarStoreProps {
  children?: ReactNode;
}
