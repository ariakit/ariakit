"use client";
import Link from "next/link.js";
import type { ReactNode } from "react";
import { Disclosure } from "site/ariakit/disclosure.react.tsx";
import { Tab, TabList, TabPanel, Tabs } from "./tabs.tsx";

export default function Layout(props: { tabs: ReactNode }) {
  return (
    <main className="main">
      <h1 className="heading">Posts</h1>
      <Disclosure button="Open">Test</Disclosure>
      <p>
        Check out the{" "}
        <Link href="/tab-nextjs" className="link">
          trending posts
        </Link>{" "}
        or stay up to date with the{" "}
        <Link href="/tab-nextjs/new" className="link">
          latest posts
        </Link>
      </p>
      <div className="wrapper">
        <Tabs>
          <TabList>
            <Tab href="/tab-nextjs">Hot</Tab>
            <Tab href="/tab-nextjs/new">New</Tab>
          </TabList>
          <TabPanel>
            <div>{props.tabs}</div>
          </TabPanel>
        </Tabs>
      </div>
    </main>
  );
}
