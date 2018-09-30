import Tabs from "./Tabs";
import TabsContainer from "./TabsContainer";
import TabsTab from "./TabsTab";
import TabsPanel from "./TabsPanel";
import TabsNext from "./TabsNext";
import TabsPrevious from "./TabsPrevious";

export * from "./Tabs";
export * from "./TabsContainer";
export * from "./TabsTab";
export * from "./TabsPanel";
export * from "./TabsNext";
export * from "./TabsPrevious";

export default Object.assign(Tabs, {
  Container: TabsContainer,
  Tab: TabsTab,
  Panel: TabsPanel,
  Next: TabsNext,
  Previous: TabsPrevious
});
