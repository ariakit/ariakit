"use client";

import * as Ariakit from "@ariakit/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

type TabHref = "/tab-nextjs-app-router" | "/tab-nextjs-app-router/new";

export function Tabs(props: Ariakit.TabProviderProps) {
  const router = useRouter();
  const selectedId = usePathname();
  const [manual, setManual] = React.useState(false);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={manual}
          onChange={(event) => setManual(event.target.checked)}
        />{" "}
        Manual activation
      </label>
      <Ariakit.TabProvider
        id="tab-nextjs-app-router-tabs"
        selectOnMove={!manual}
        selectedId={selectedId}
        setSelectedId={(id) => {
          if (id === "/tab-nextjs-app-router") {
            router.push(id);
          }
          if (id === "/tab-nextjs-app-router/new") {
            router.push(id);
          }
        }}
        {...props}
      />
    </>
  );
}

export const TabList = React.forwardRef<HTMLDivElement, Ariakit.TabListProps>(
  function TabList(props, ref) {
    return <Ariakit.TabList ref={ref} {...props} />;
  },
);

interface TabProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href"
> {
  href: TabHref;
}

export const Tab = React.forwardRef<HTMLAnchorElement, TabProps>(
  function Tab(props, ref) {
    const id = props.href;
    return <Ariakit.Tab id={id} render={<Link ref={ref} {...props} />} />;
  },
);

export const TabPanel = React.forwardRef<HTMLDivElement, Ariakit.TabPanelProps>(
  function TabPanel(props, ref) {
    const tab = Ariakit.useTabContext();
    const tabId = Ariakit.useStoreState(tab, "selectedId");
    return <Ariakit.TabPanel ref={ref} tabId={tabId} {...props} />;
  },
);
