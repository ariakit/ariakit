import * as Ariakit from "@ariakit/react";

// The tab list has no tab panels because routed tabs render their panel from
// the destination page.
export default function Example() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Ariakit.Focusable render={<a href="?link=enabled" />}>
        Enabled link
      </Ariakit.Focusable>
      <Ariakit.Focusable disabled render={<a href="?link=disabled" />}>
        Disabled link
      </Ariakit.Focusable>
      <Ariakit.Focusable
        disabled
        accessibleWhenDisabled
        render={<a href="?link=accessible" />}
      >
        Accessible disabled link
      </Ariakit.Focusable>
      <Ariakit.TabProvider defaultSelectedId="overview">
        <Ariakit.TabList aria-label="Sections">
          <Ariakit.Tab id="overview" render={<a href="?tab=overview" />}>
            Overview
          </Ariakit.Tab>
          <Ariakit.Tab id="billing" disabled render={<a href="?tab=billing" />}>
            Billing
          </Ariakit.Tab>
        </Ariakit.TabList>
      </Ariakit.TabProvider>
    </div>
  );
}
