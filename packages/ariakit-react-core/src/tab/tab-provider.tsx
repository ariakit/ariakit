import type { ReactNode } from "react";
import { registerTabProvider, TabContextProvider } from "./tab-context.tsx";
import type { TabStoreProps } from "./tab-store.ts";
import { useTabStore } from "./tab-store.ts";

/**
 * Provides a tab store to [Tab](https://ariakit.org/components/tab) components.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * <TabProvider>
 *   <TabList>
 *     <Tab>For You</Tab>
 *     <Tab>Following</Tab>
 *   </TabList>
 *   <TabPanel>For You</TabPanel>
 *   <TabPanel>Following</TabPanel>
 * </TabProvider>
 * ```
 */
export function TabProvider(props: TabProviderProps = {}) {
  const store = useTabStore(props);
  return (
    <TabContextProvider value={store}>{props.children}</TabContextProvider>
  );
}

registerTabProvider(TabProvider);

export interface TabProviderProps extends TabStoreProps {
  children?: ReactNode;
}
