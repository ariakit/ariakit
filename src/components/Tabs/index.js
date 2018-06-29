import Tabs from "./Tabs";
import TabsContainer from "./TabsContainer";
import TabsTab from "./TabsTab";
import TabsPanel from "./TabsPanel";
import Step from "../Step";

Tabs.Container = TabsContainer;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
Tabs.Next = Step.Next;
Tabs.Previous = Step.Previous;
Tabs.Select = Step.Select;

export default Tabs;
