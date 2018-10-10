import Tabs from "./Tabs";
import TabsContainer from "./TabsContainer";
import TabsNext from "./TabsNext";
import TabsPanel from "./TabsPanel";
import TabsPrevious from "./TabsPrevious";
import TabsTab from "./TabsTab";

export * from "./Tabs";
export * from "./TabsContainer";
export * from "./TabsNext";
export * from "./TabsPanel";
export * from "./TabsPrevious";
export * from "./TabsTab";

export default Object.assign(Tabs, {
  Container: TabsContainer,
  Next: TabsNext,
  Panel: TabsPanel,
  Previous: TabsPrevious,
  Tab: TabsTab
});
