import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Tab,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
  TabSlot,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { CircleCheckIcon, CircleDotIcon } from "lucide-react";
import { useState } from "react";

interface Issue {
  id: string;
  title: string;
  closed?: boolean;
}

const issues: Issue[] = [
  { id: "login", title: "Login button overlaps the logo" },
  { id: "export", title: "Export fails on large reports" },
  { id: "dates", title: "Dates ignore the time zone", closed: true },
  { id: "search", title: "Search misses archived items" },
  { id: "avatar", title: "Avatar upload has no progress", closed: true },
  { id: "invoice", title: "Invoice totals round down", closed: true },
];

const open = issues.filter((issue) => !issue.closed);
const closed = issues.filter((issue) => issue.closed);

export default function Example() {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "issues-open",
  );
  const items = selectedId === "issues-closed" ? closed : open;
  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      $rounded="2xl"
      className="w-[28rem] max-w-full"
    >
      <TabList aria-label="Issues" $size="sm">
        <Tab id="issues-open">
          <TabSlot>
            <CircleDotIcon />
          </TabSlot>
          <TabLabel>Open</TabLabel>
          <TabSlot $kind="box">
            <Badge $kind="solid" $round>
              {open.length}
            </Badge>
          </TabSlot>
        </Tab>
        <Tab id="issues-closed">
          <TabSlot>
            <CircleCheckIcon />
          </TabSlot>
          <TabLabel>Closed</TabLabel>
          <TabSlot $kind="box">
            <Badge $round>{closed.length}</Badge>
          </TabSlot>
        </Tab>
      </TabList>
      <TabPanels $p={4}>
        {/* The tabs filter one list, so one panel follows the selected tab. */}
        <TabPanel single>
          <ul className="grid gap-2">
            {items.map((issue) => (
              <li key={issue.id}>{issue.title}</li>
            ))}
          </ul>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
