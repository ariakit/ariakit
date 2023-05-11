import "./style.css";
import type { ReactNode } from "react";
import Link from "next/link.js";
import { Tab, TabList, TabPanel, Tabs } from "./tabs.jsx";

export default function Layout(props: { tabs: ReactNode }) {
  return (
    <main className="main">
      <h1 className="heading">Posts</h1>
      <p>
        Check out the{" "}
        <Link href="/previews/tab-next-router" className="link">
          trending posts
        </Link>{" "}
        or stay up to date with the{" "}
        <Link href="/previews/tab-next-router/new" className="link">
          latest posts
        </Link>
      </p>
      <div className="wrapper">
        <Tabs>
          <TabList>
            <Tab href="/previews/tab-next-router">Hot</Tab>
            <Tab href="/previews/tab-next-router/new">New</Tab>
          </TabList>
          <TabPanel>{props.tabs}</TabPanel>
        </Tabs>
      </div>
    </main>
  );
}
