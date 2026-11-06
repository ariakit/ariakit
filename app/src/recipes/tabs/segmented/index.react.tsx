import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  TabList,
  TabPanel,
  TabProvider,
} from "@ariakit/ui/components/tabs.ariakit.react";

const ranges = [
  { id: "range-day", label: "Day", visits: "1,204", signups: "38" },
  { id: "range-week", label: "Week", visits: "8,912", signups: "241" },
  { id: "range-month", label: "Month", visits: "36,450", signups: "1,017" },
];

export default function Example() {
  return (
    <TabProvider defaultSelectedId="range-week">
      <div className="grid w-[24rem] max-w-full gap-4">
        <TabList
          aria-label="Time range"
          $kind="segmented"
          $layout="stretch"
          tabs={Object.fromEntries(
            ranges.map((range) => [range.id, range.label]),
          )}
        />
        {ranges.map((range) => (
          <TabPanel key={range.id} tabId={range.id}>
            <dl className="grid grid-cols-2 gap-3">
              <Frame $lighten $rounded="xl" $border $p={4}>
                <dt className="ak-ink-70 text-sm">Visits</dt>
                <dd className="text-2xl font-semibold">{range.visits}</dd>
              </Frame>
              <Frame $lighten $rounded="xl" $border $p={4}>
                <dt className="ak-ink-70 text-sm">Sign-ups</dt>
                <dd className="text-2xl font-semibold">{range.signups}</dd>
              </Frame>
            </dl>
          </TabPanel>
        ))}
      </div>
    </TabProvider>
  );
}
