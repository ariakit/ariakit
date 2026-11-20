import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabRow,
  TabRowButton,
  Tabs,
  TabSlot,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { ListTreeIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useId, useState } from "react";

const pages = [
  {
    id: "brief",
    label: "Brief",
    sections: ["Goal", "Audience", "Schedule"],
    text: "The spring catalog shows 40 products on 24 pages.",
  },
  {
    id: "notes",
    label: "Notes",
    sections: ["Photos", "Paper", "Print run"],
    text: "The photos for pages 8 to 12 arrive on Thursday.",
  },
  {
    id: "feedback",
    label: "Feedback",
    sections: ["Cover", "Prices"],
    text: "Two reviewers ask for a larger price on the cover.",
  },
];

const sizes = ["text-sm", "text-base", "text-lg"];

export default function Example() {
  const outlineId = useId();
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "document-brief",
  );
  const [outline, setOutline] = useState(false);
  const [size, setSize] = useState(1);
  const page = pages.find((page) => `document-${page.id}` === selectedId);
  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      className="w-[32rem] max-w-full"
    >
      {/* The row holds the tab list and the buttons beside it. The buttons are
          outside the tab list, so the Tab key reaches them, and they are not
          tabs for screen readers. */}
      <TabRow>
        <TabRowButton
          aria-label="Outline"
          aria-expanded={outline}
          aria-controls={outlineId}
          onClick={() => setOutline(!outline)}
        >
          <TabSlot>
            <ListTreeIcon />
          </TabSlot>
        </TabRowButton>
        <TabList aria-label="Document">
          {pages.map((page) => (
            <Tab key={page.id} id={`document-${page.id}`} separator>
              {page.label}
            </Tab>
          ))}
        </TabList>
        {/* This element takes the free space, so the buttons after it sit at
            the end of the row. */}
        <div className="grow" />
        <TabRowButton
          aria-label="Smaller text"
          // A button at its limit keeps the focus that pressed it.
          accessibleWhenDisabled
          disabled={size === 0}
          onClick={() => setSize(size - 1)}
        >
          <TabSlot>
            <ZoomOutIcon />
          </TabSlot>
        </TabRowButton>
        <TabRowButton
          aria-label="Larger text"
          accessibleWhenDisabled
          disabled={size === sizes.length - 1}
          onClick={() => setSize(size + 1)}
        >
          <TabSlot>
            <ZoomInIcon />
          </TabSlot>
        </TabRowButton>
      </TabRow>
      <TabPanels>
        {/* The tabs are pages of one document, so one panel follows the
            selected tab. */}
        <TabPanel single className="grid gap-2">
          <ul id={outlineId} hidden={!outline} className="ak-ink-70 text-sm">
            {page?.sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
          <p className={sizes[size]}>{page?.text}</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
