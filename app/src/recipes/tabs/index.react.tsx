import {
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";

export default function Example() {
  return (
    <Tabs defaultSelectedId="project-overview" className="w-[28rem] max-w-full">
      <TabList
        aria-label="Project"
        tabs={{
          "project-overview": "Overview",
          "project-activity": "Activity",
          "project-members": "Members",
        }}
      />
      <TabPanels>
        <TabPanel tabId="project-overview">
          The website redesign is on track for the June release.
        </TabPanel>
        <TabPanel tabId="project-activity">
          Maya Chen moved three tasks to review this morning.
        </TabPanel>
        <TabPanel tabId="project-members">
          Six people work on this project, in two teams.
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
