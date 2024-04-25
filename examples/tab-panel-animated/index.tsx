import { useId } from "react";
import { Tab, TabList, TabPanel, TabProvider } from "./animated-tabs.tsx";
import "./style.css";

export default function Example() {
  const defaultSelectedId = useId();
  return (
    <TabProvider defaultSelectedId={defaultSelectedId}>
      <TabList aria-label="Posts">
        <Tab id={defaultSelectedId}>Popular</Tab>
        <Tab>Recent</Tab>
        <Tab>Explore</Tab>
      </TabList>
      <div className="panels">
        <TabPanel tabId={defaultSelectedId}>
          <ul className="list">
            <li>Answering “What ARIA can I use?”</li>
            <li>Privacy Principles for the Web</li>
            <li>Stepping forward on WAI management</li>
            <li>W3C Accessibility Maturity Model</li>
          </ul>
        </TabPanel>
        <TabPanel>
          <ul className="list">
            <li>Making WebViews work for the Web</li>
            <li>Remote Meeting Agenda in Development</li>
            <li>W3C Accessibility Maturity Model</li>
            <li>Stepping forward on WAI management</li>
          </ul>
        </TabPanel>
        <TabPanel>
          <ul className="list">
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
