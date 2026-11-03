import {
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";

const pages = {
  "docs-overview": "Overview",
  "docs-start": "Getting started",
  "docs-usage": "Usage",
  "docs-api": "API reference",
  "docs-styling": "Styling",
  "docs-accessibility": "Accessibility",
  "docs-migration": "Migration",
  "docs-changelog": "Changelog",
};

export default function Example() {
  return (
    <Tabs defaultSelectedId="docs-overview" className="w-[26rem] max-w-full">
      <TabList aria-label="Documentation" tabs={pages} />
      <TabPanels>
        {Object.entries(pages).map(([id, label]) => (
          <TabPanel key={id} tabId={id}>
            The {label} page. Use the arrow keys to bring the next tabs into
            view.
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
