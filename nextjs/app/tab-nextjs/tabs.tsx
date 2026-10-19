"use client";

import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/tab-nextjs", label: "Hot" },
  { href: "/tab-nextjs/new", label: "New" },
] as const;

type TabHref = (typeof tabs)[number]["href"];

function isTabHref(id: string | null | undefined): id is TabHref {
  return tabs.some((tab) => tab.href === id);
}

export interface PostTabsProps {
  children?: ReactNode;
}

export function PostTabs({ children }: PostTabsProps) {
  const router = useRouter();
  // The URL owns the selection, so each tab id is its route.
  const selectedId = usePathname();
  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={(id) => {
        if (!isTabHref(id)) return;
        if (id === selectedId) return;
        router.push(id);
      }}
    >
      <TabList aria-label="Posts">
        {tabs.map((tab) => (
          <Tab key={tab.href} id={tab.href} render={<Link href={tab.href} />}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        <TabPanel single>{children}</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
