import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";

export default function Example() {
  return (
    <Tabs
      defaultSelectedId="account-profile"
      $border={false}
      $p={1.5}
      $rounded="2xl"
      className="w-[28rem] max-w-full"
    >
      <TabList aria-label="Account" $darken={false} className="border-b">
        <Tab id="account-profile" $kind="flat" bar>
          Profile
        </Tab>
        <Tab id="account-security" $kind="flat" bar>
          Security
        </Tab>
        <Tab id="account-billing" $kind="flat" bar>
          Billing
        </Tab>
      </TabList>
      <TabPanels $lighten={false} $p={2}>
        <TabPanel tabId="account-profile">
          Your name and photo show on your comments.
        </TabPanel>
        <TabPanel tabId="account-security">
          Two-step verification is on for this account.
        </TabPanel>
        <TabPanel tabId="account-billing">
          Your plan renews on the first day of each month.
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
