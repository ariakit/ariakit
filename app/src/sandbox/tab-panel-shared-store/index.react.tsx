import * as ak from "@ariakit/react";
import {
  Tab,
  TabList,
  TabPanel,
  TabProvider,
} from "@ariakit/ui/components/tabs.ariakit.react";

interface ActivityTabsProps {
  name: string;
  pinned?: boolean;
}

function ActivityTabs({ name, pinned }: ActivityTabsProps) {
  const activityId = `${name.toLowerCase()}-activity`;
  const reviewsId = `${name.toLowerCase()}-reviews`;
  const store = ak.useTabStore({ defaultSelectedId: activityId });
  const selectedId = ak.useStoreState(store, "selectedId");
  // Pinned panels keep their tabId when another tab becomes selected.
  return (
    <section className="grid gap-2">
      <h2>{name} updates</h2>
      <TabList store={store} aria-label={`${name} updates`}>
        <Tab id={activityId}>{name} activity</Tab>
        <Tab id={reviewsId}>{name} reviews</Tab>
      </TabList>
      <TabPanel store={store} single {...(pinned && { tabId: activityId })}>
        {selectedId === activityId
          ? `${name} activity updates`
          : `${name} review updates`}
      </TabPanel>
    </section>
  );
}

export default function Example() {
  // Team's explicit store must take precedence over the surrounding provider.
  return (
    <div className="grid gap-6">
      <ActivityTabs name="Project" />
      <TabProvider defaultSelectedId="unrelated">
        <ActivityTabs name="Team" />
      </TabProvider>
      <ActivityTabs name="Pinned" pinned />
    </div>
  );
}
