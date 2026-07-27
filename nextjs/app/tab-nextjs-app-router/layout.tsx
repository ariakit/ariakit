import Link from "next/link";
import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "./tabs.tsx";

export default function Layout(props: { tabs: ReactNode }) {
  return (
    <main>
      <h1>Posts</h1>
      <p>
        Check out the <Link href="/tab-nextjs-app-router">trending posts</Link>{" "}
        or stay up to date with the{" "}
        <Link href="/tab-nextjs-app-router/new">latest posts</Link>.
      </p>
      <Tabs selectOnMove={false}>
        <TabList>
          <Tab href="/tab-nextjs-app-router">Hot</Tab>
          <Tab href="/tab-nextjs-app-router/new">New</Tab>
        </TabList>
        <TabPanel>{props.tabs}</TabPanel>
      </Tabs>
    </main>
  );
}
