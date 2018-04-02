import Tabs from "./Tabs";
import TabsTab from "./TabsTab";
import TabsPanel from "./TabsPanel";
import TabsState from "./TabsState";
import Step from "../Step";

Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
Tabs.State = TabsState;
Tabs.Next = Step.Next;
Tabs.Previous = Step.Previous;
Tabs.Select = Step.Select;

export default Tabs;
