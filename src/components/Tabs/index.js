import Tabs from './Tabs'
import TabsTab from './TabsTab'
import TabsPanel from './TabsPanel'
import Step from '../Step'

Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel
Tabs.Next = Step.Next
Tabs.Previous = Step.Previous
Tabs.Select = Step.Select

export default Tabs

export withTabsState from './withTabsState'
