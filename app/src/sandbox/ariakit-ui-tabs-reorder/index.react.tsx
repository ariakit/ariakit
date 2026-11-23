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
import { PlusIcon } from "lucide-react";
import { StrictMode, useState } from "react";

interface Item {
  id: string;
  name: string;
  disabled?: boolean;
}

function useItems(initialItems: Item[]) {
  const [items, setItems] = useState(initialItems);
  const [moves, setMoves] = useState(0);
  const reorder = (ids: string[]) => {
    setItems((items) =>
      [...items].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)),
    );
    setMoves((moves) => moves + 1);
  };
  return { items, setItems, moves, reorder };
}

interface OrderProps {
  label: string;
  items: Item[];
  moves: number;
}

// The order and the number of onReorder calls, as text on the page.
function Order({ label, items, moves }: OrderProps) {
  const names = items.map((item) => item.name).join(", ");
  return (
    <p className="text-sm opacity-70">
      {label}: {moves} {moves === 1 ? "move" : "moves"}. {names}
    </p>
  );
}

// The tabs of the Tabs That Open and Close example: a tab row with a button
// after the strip, and tabs that close.
function OpenNotes() {
  const { items, setItems, moves, reorder } = useItems([
    { id: "note-groceries", name: "Groceries" },
    { id: "note-workshop", name: "Workshop" },
    { id: "note-trip", name: "Trip" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "note-groceries",
  );
  const [count, setCount] = useState(1);
  const addNote = () => {
    const note = { id: `note-new-${count}`, name: `Note ${count}` };
    setCount(count + 1);
    setItems([...items, note]);
    setSelectedId(note.id);
  };
  const removeNote = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id));
  };
  const closable = items.length > 1;
  return (
    <section className="grid gap-2">
      <Tabs
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        $outerEdge={false}
        $darken={false}
        className="w-[32rem] max-w-full"
      >
        <TabRow>
          <TabList aria-label="Open notes" onReorder={reorder}>
            {items.map((item, index) => (
              <Tab
                key={item.id}
                id={item.id}
                separator={!!index}
                onRemove={closable ? () => removeNote(item.id) : undefined}
              >
                {item.name}
              </Tab>
            ))}
          </TabList>
          <TabRowButton aria-label="New note" separator onClick={addNote}>
            <TabSlot>
              <PlusIcon />
            </TabSlot>
          </TabRowButton>
        </TabRow>
        <TabPanels>
          {items.map((item) => (
            <TabPanel key={item.id} tabId={item.id}>
              The {item.name} note
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Order label="Open notes" items={items} moves={moves} />
    </section>
  );
}

// Tabs of different widths in a strip that scrolls, with a disabled tab.
function Files() {
  const { items, moves, reorder } = useItems([
    { id: "file-index", name: "index.ts" },
    { id: "file-tabs", name: "tabs.ariakit.react.tsx" },
    { id: "file-utils", name: "utils.ts" },
    { id: "file-readme", name: "README.md" },
    { id: "file-package", name: "package.json", disabled: true },
    { id: "file-tsconfig", name: "tsconfig.json" },
    { id: "file-vite", name: "vite.config.ts" },
  ]);
  return (
    <section className="grid gap-2">
      <Tabs defaultSelectedId="file-index" className="w-[28rem] max-w-full">
        <TabList aria-label="Files" onReorder={reorder}>
          {items.map((item, index) => (
            <Tab
              key={item.id}
              id={item.id}
              separator={!!index}
              disabled={item.disabled}
            >
              {item.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {items.map((item) => (
            <TabPanel key={item.id} tabId={item.id}>
              The {item.name} file
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Order label="Files" items={items} moves={moves} />
    </section>
  );
}

// A stretched strip: its last tab meets the end corner of the panel.
function Views() {
  const { items, moves, reorder } = useItems([
    { id: "view-board", name: "Board" },
    { id: "view-list", name: "List" },
    { id: "view-calendar", name: "Calendar" },
  ]);
  return (
    <section className="grid gap-2">
      <Tabs defaultSelectedId="view-board" className="w-[24rem] max-w-full">
        <TabList aria-label="Views" $layout="stretch" onReorder={reorder}>
          {items.map((item) => (
            <Tab key={item.id} id={item.id}>
              {item.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {items.map((item) => (
            <TabPanel key={item.id} tabId={item.id}>
              The {item.name} view
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Order label="Views" items={items} moves={moves} />
    </section>
  );
}

// The same tabs from right to left, where the first tab is at the right.
function Pages() {
  const { items, moves, reorder } = useItems([
    { id: "page-home", name: "Home" },
    { id: "page-search", name: "Search" },
    { id: "page-settings", name: "Settings" },
  ]);
  return (
    <section className="grid gap-2" dir="rtl">
      <Tabs rtl defaultSelectedId="page-home" className="w-[24rem] max-w-full">
        <TabList aria-label="Pages" onReorder={reorder}>
          {items.map((item, index) => (
            <Tab key={item.id} id={item.id} separator={!!index}>
              {item.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {items.map((item) => (
            <TabPanel key={item.id} tabId={item.id}>
              The {item.name} page
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Order label="Pages" items={items} moves={moves} />
    </section>
  );
}

// A tab list without onReorder, whose tabs stay where they are.
function Fixed() {
  return (
    <Tabs defaultSelectedId="fixed-one" className="w-[24rem] max-w-full">
      <TabList aria-label="Fixed tabs">
        <Tab id="fixed-one">One</Tab>
        <Tab id="fixed-two" separator>
          Two
        </Tab>
        <Tab id="fixed-three" separator>
          Three
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel tabId="fixed-one">The first panel</TabPanel>
        <TabPanel tabId="fixed-two">The second panel</TabPanel>
        <TabPanel tabId="fixed-three">The third panel</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

// StrictMode runs the effects of the tab list again as it mounts, so the drag
// has to work after its listeners were removed once.
export default function Example() {
  return (
    <StrictMode>
      <div className="grid gap-8 p-8">
        <OpenNotes />
        <Files />
        <Views />
        <Pages />
        <Fixed />
      </div>
    </StrictMode>
  );
}
