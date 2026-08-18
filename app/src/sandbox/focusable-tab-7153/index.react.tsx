import * as Ariakit from "@ariakit/react";
import type { MouseEvent } from "react";

// `Focusable` disables click, mousedown, and keypress while the element is
// disabled, but not the auxclick a middle click fires, so a disabled link still
// opens its destination.
// TODO: Remove once https://github.com/ariakit/ariakit/issues/7153 is fixed.
function blockAuxClick(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
}

// The tab list has no tab panels because routed tabs render their panel from
// the destination page.
export default function Example() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Ariakit.Focusable render={<a href="?link=enabled" />}>
        Enabled link
      </Ariakit.Focusable>
      <Ariakit.Focusable
        disabled
        onAuxClickCapture={blockAuxClick}
        render={<a href="?link=disabled" />}
      >
        Disabled link
      </Ariakit.Focusable>
      <Ariakit.Focusable
        disabled
        accessibleWhenDisabled
        onAuxClickCapture={blockAuxClick}
        render={<a href="?link=accessible" />}
      >
        Accessible disabled link
      </Ariakit.Focusable>
      <Ariakit.TabProvider defaultSelectedId="overview">
        <Ariakit.TabList aria-label="Sections">
          <Ariakit.Tab id="overview" render={<a href="?tab=overview" />}>
            Overview
          </Ariakit.Tab>
          <Ariakit.Tab
            id="billing"
            disabled
            onAuxClickCapture={blockAuxClick}
            render={<a href="?tab=billing" />}
          >
            Billing
          </Ariakit.Tab>
        </Ariakit.TabList>
      </Ariakit.TabProvider>
    </div>
  );
}
