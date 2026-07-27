import { useId } from "react";
import { Tab, TabList, TabPanel, TabProvider } from "./animated-tabs.tsx";

export default function Example() {
  const defaultSelectedId = useId();
  return (
    <TabProvider defaultSelectedId={defaultSelectedId}>
      <TabList aria-label="Posts">
        <Tab id={defaultSelectedId}>Popular</Tab>
        <Tab>Recent</Tab>
        <Tab>Explore</Tab>
      </TabList>
      <div className="relative flex w-full flex-col items-center overflow-hidden p-0">
        <TabPanel tabId={defaultSelectedId}>
          <ul>
            <li>Answering “What ARIA can I use?”</li>
            <li>Privacy Principles for the Web</li>
            <li>Stepping forward on WAI management</li>
            <li>W3C Accessibility Maturity Model</li>
          </ul>
        </TabPanel>
        <TabPanel>
          <ul>
            <li>Making WebViews work for the Web</li>
            <li>Remote Meeting Agenda in Development</li>
            <li>W3C Accessibility Maturity Model</li>
            <li>Stepping forward on WAI management</li>
          </ul>
        </TabPanel>
        <TabPanel>
          <ul>
            <li>W3C Accessibility Maturity Model</li>
            <li>Stepping forward on WAI management</li>
            <li>Answering “What ARIA can I use?”</li>
            <li>Privacy Principles for the Web</li>
          </ul>
        </TabPanel>
      </div>
    </TabProvider>
  );
}
