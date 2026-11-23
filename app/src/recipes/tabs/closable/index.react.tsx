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
import { useState } from "react";

interface Note {
  id: string;
  name: string;
  text: string;
}

const initialNotes: Note[] = [
  {
    id: "note-groceries",
    name: "Groceries",
    text: "Oat milk, rye bread, and two lemons.",
  },
  {
    id: "note-workshop",
    name: "Workshop",
    text: "Sand the shelf before the second coat of oil.",
  },
  {
    id: "note-trip",
    name: "Trip",
    text: "The night train leaves at 21:40 from platform 3.",
  },
];

export default function Example() {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "note-groceries",
  );
  const [count, setCount] = useState(1);

  const addNote = () => {
    const note = { id: `note-new-${count}`, name: `Note ${count}`, text: "" };
    setCount(count + 1);
    setNotes([...notes, note]);
    setSelectedId(note.id);
  };

  // The tab moves the selection and the focus to the tab beside it before it
  // calls onRemove, so this only removes the note.
  const removeNote = (id: string) => {
    setNotes((notes) => notes.filter((note) => note.id !== id));
  };

  // The tab list doesn't change the order itself. After a drag or a move with
  // the keyboard, it gives the IDs of the tabs in their new order.
  const reorderNotes = (ids: string[]) => {
    setNotes((notes) =>
      [...notes].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)),
    );
  };

  // Without another tab, nothing can take the selection, so the last tab stays.
  const closable = notes.length > 1;

  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      $outerEdge={false}
      $darken={false}
      className="w-[32rem] max-w-full"
    >
      <TabRow>
        <TabList aria-label="Open notes" onReorder={reorderNotes}>
          {notes.map((note, index) => (
            <Tab
              key={note.id}
              id={note.id}
              separator={!!index}
              onRemove={closable ? () => removeNote(note.id) : undefined}
            >
              {note.name}
            </Tab>
          ))}
        </TabList>
        {/* A button after the tab list, not a tab, opens a tab. */}
        <TabRowButton aria-label="New note" separator onClick={addNote}>
          <TabSlot>
            <PlusIcon />
          </TabSlot>
        </TabRowButton>
      </TabRow>
      <TabPanels>
        {notes.map((note) => (
          <TabPanel key={note.id} tabId={note.id}>
            {note.text || "This note is empty."}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
