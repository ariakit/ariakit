"use client";

import * as Ariakit from "@ariakit/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Tabs() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("tab") ?? "fruits";
  return (
    <Ariakit.TabProvider selectedId={selectedId} selectOnMove={false}>
      <Ariakit.TabList aria-label="Groceries">
        <Ariakit.Tab
          id="fruits"
          render={<Link href="/tab-nextjs-manual-activation" />}
        >
          Fruits
        </Ariakit.Tab>
        <Ariakit.Tab
          id="vegetables"
          render={<Link href="/tab-nextjs-manual-activation?tab=vegetables" />}
        >
          Vegetables
        </Ariakit.Tab>
        <Ariakit.Tab
          id="meat"
          render={<Link href="/tab-nextjs-manual-activation?tab=meat" />}
        >
          Meat
        </Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel tabId="fruits">Apples and oranges</Ariakit.TabPanel>
      <Ariakit.TabPanel tabId="vegetables">Carrots and onions</Ariakit.TabPanel>
      <Ariakit.TabPanel tabId="meat">Beef and chicken</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

export default function TabPage() {
  return (
    <Suspense>
      <Tabs />
    </Suspense>
  );
}
