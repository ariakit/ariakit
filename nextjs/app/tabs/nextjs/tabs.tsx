"use client";

import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const pages = [
  { path: "/tabs/nextjs", label: "Inbox" },
  { path: "/tabs/nextjs/sent", label: "Sent" },
  { path: "/tabs/nextjs/drafts", label: "Drafts" },
] as const;

export interface MailTabsProps {
  children?: ReactNode;
}

export function MailTabs({ children }: MailTabsProps) {
  const pathname = usePathname();
  return (
    // The URL owns the selection, so each tab id is its route. Only the links
    // navigate. Without selection on move, the arrow keys start no navigations,
    // and Enter follows the focused link.
    <Tabs
      selectedId={pathname}
      selectOnMove={false}
      className="w-[28rem] max-w-full"
    >
      <TabList aria-label="Mail">
        {pages.map((page) => (
          <Tab
            key={page.path}
            id={page.path}
            render={<Link href={page.path} />}
          >
            {page.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        <TabPanel single>{children}</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
