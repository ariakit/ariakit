import { Glider } from "@ariakit/ui/components/glider.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import type { TabRowFrameProps } from "@ariakit/ui/components/tabs.ariakit.react";
import {
  Tab,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
  TabRow,
  TabRowButton,
  TabRowFrame,
  Tabs,
  TabSlot,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import {
  ArchiveIcon,
  HouseIcon,
  NotebookTextIcon,
  PanelLeftIcon,
  PlaneIcon,
  PlusIcon,
} from "lucide-react";
import { useId, useState } from "react";

interface Note {
  id: string;
  name: string;
  paragraphs: React.ReactNode[];
}

const initialNotes: Note[] = [
  {
    id: "note-trip",
    name: "Trip",
    paragraphs: [
      <>
        The night train leaves at 21:40 from platform 3. Board 20 minutes early,
        because the sleeping cars are at the far end. The{" "}
        <a href="#booking">booking</a> has the car and the berth numbers.
      </>,
      "The train arrives at 08:15. Leave the bags in the station lockers and walk to the old harbor for breakfast.",
      "The ferry to the island runs every two hours. Buy a return ticket, because the last boat back leaves at 18:30.",
      "Rent bicycles next to the pier. The coast road to the lighthouse is 14 km and mostly flat.",
      "The lighthouse closes at 16:00. Bring cash, because the ticket desk does not take cards.",
      "Dinner is at the fish market hall. The stalls at the back are cheaper and less crowded.",
      "On the second day, take the bus to the mountain village. The bus stop is behind the town hall.",
      "The trail to the waterfall takes three hours. Carry water, because there is no shop after the village.",
      "The return bus leaves at 17:10. If you miss it, a shared taxi waits at the same stop.",
      "The market on the square opens at 07:00 on Saturdays. Buy bread and cheese there for the train.",
      "The boat museum is free on the first Sunday of the month. Two hours are enough for both floors.",
      "Send the postcards from the island. The post office there has a stamp with the lighthouse on it.",
      "Keep the ferry receipt. The hotel gives a discount on breakfast with it.",
      "The tram to the station runs every ten minutes. A single ticket is valid for one hour.",
      "Check out before 11:00 on the last day. The day train home has a dining car, so skip the station cafe.",
    ],
  },
  {
    id: "note-workshop",
    name: "Workshop",
    paragraphs: [
      "Sand the shelf before the second coat of oil.",
      "The hinges for the cabinet door arrive on Friday.",
    ],
  },
  {
    id: "note-groceries",
    name: "Groceries",
    paragraphs: ["Oat milk, rye bread, and two lemons."],
  },
];

const notebooks = [
  { id: "all-notes", name: "All notes", icon: NotebookTextIcon },
  { id: "travel", name: "Travel", icon: PlaneIcon },
  { id: "home", name: "Home", icon: HouseIcon },
  { id: "archive", name: "Archive", icon: ArchiveIcon },
];

// Both Tabs keep this margin, so the toggle button is where a first button of
// the row below would be. The edge is inside the margin: an edge that is a
// border takes room, and one that is a ring doesn't, so the margin gives up the
// width of the border, and the tabs stay in place in light and dark mode.
const tabsMargin = "calc(var(--spacing) * 2 - var(--ak-frame-border))";

/** The logo of the app: its mark and its name, in a part of a tab row. */
function NotesLogo(props: TabRowFrameProps) {
  const gradientId = useId();
  return (
    <TabRowFrame $p="var(--tab-padding)" className="font-semibold" {...props}>
      {/* The mark has the size of the other icons. */}
      <TabSlot>
        <svg viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbbf24" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
          {/* A note with its bottom corner folded up. */}
          <path
            d="M6 0h12a6 6 0 0 1 6 6v9l-9 9H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6z"
            fill={`url(#${gradientId})`}
          />
          <path d="M24 15l-9 9v-5a4 4 0 0 1 4-4z" fill="#fde68a" />
          <path
            d="M6.5 7.5h11M6.5 12h7"
            stroke="#fff"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
      </TabSlot>
      <TabLabel>Notes</TabLabel>
    </TabRowFrame>
  );
}

export default function Example() {
  const sidebarId = useId();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "note-trip",
  );
  const [count, setCount] = useState(1);

  const addNote = () => {
    const id = `note-new-${count}`;
    setCount(count + 1);
    setNotes([...notes, { id, name: `Note ${count}`, paragraphs: [] }]);
    setSelectedId(id);
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
    // The places of the rows come from the 1px edge of the tabs and the padding
    // of the tabs, the buttons, and the logo, which each part resolves with its
    // own text size.
    <Shell
      $darken={0.5}
      className="[--edge:1px] [--tab-padding:round(--spacing(3),1px)]"
    >
      {/* A scroll padding keeps a focused link out from under the sticky row
          and the margin below the frame. CSS can't give the height of the row
          to the page, so these are fixed values for the default text size,
          with some room. */}
      <style>
        {
          "html { scroll-padding-block: calc(var(--spacing) * 10 + 1.25rem) calc(var(--spacing) * 4); }"
        }
      </style>
      {/* The toggle button and the logo take their styles from a Tabs, so they
          are in a second Tabs, in a layer above the sidebar and the tabs, and
          stay in place while those move. Its transparent layer leaves out the
          strip color of the row, which would cover the first tab. This Tabs
          has no panel, so $panelRoundedTop={false} drops the notch for panel
          corners, and its row is only as tall as the tabs and takes no presses
          below them. */}
      <Tabs
        $outerEdge={false}
        $layer="transparent"
        $panelRoundedTop={false}
        $border="var(--edge)"
        $m={tabsMargin}
        className="sticky top-(--ak-frame-margin) z-3 col-[shell] row-[main-start/body-end] self-start justify-self-start"
      >
        <TabRow>
          {/* The button shows only an icon, so a tooltip names the action that
              a click takes. The accessible name stays the same, and
              aria-expanded tells the state. */}
          <Tooltip text={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
            <TabRowButton
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              aria-controls={sidebarId}
              $p="var(--tab-padding)"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <TabSlot>
                <PanelLeftIcon />
              </TabSlot>
            </TabRowButton>
          </Tooltip>
          {/* The logo stays beside the button in both states. It has the box
              of a tab, so its mark and its name line up with the button and
              the tabs. */}
          <NotesLogo separator />
        </TabRow>
      </Tabs>
      {/* The sidebar is on the background of the shell, beside the frame of
          the tabs, so it draws no edge toward main, and its header draws no
          line below it. */}
      <ShellSidebar
        id={sidebarId}
        open={sidebarOpen}
        $show
        $width="sm"
        $border={false}
        $reveal="zoom"
        landmark="nav"
        aria-label="Notebooks"
      >
        {/* The header keeps the room of the row above, with the toggle button
            and the logo, so the links start below it. */}
        <ShellSidebarHeader $border={false} />
        <ShellSidebarBody>
          {/* The tabs keep their margin beside the sidebar, so the links reach
              into the end padding of the body by that margin, less the edge of
              the tabs, which is inside the margin. The links then have the
              same space on each side. */}
          <div className="-me-[calc(--spacing(2)-var(--edge))]">
            <Nav $p="none">
              {notebooks.map((notebook, index) => (
                <NavLink
                  key={notebook.id}
                  href={`#${notebook.id}`}
                  aria-current={index === 0 ? "page" : undefined}
                >
                  <NavSlot>
                    <notebook.icon />
                  </NavSlot>
                  <NavLinkLabel>{notebook.name}</NavLinkLabel>
                </NavLink>
              ))}
            </Nav>
          </div>
        </ShellSidebarBody>
      </ShellSidebar>
      {/* Main takes all the room beside the sidebar, not a column of the
          default width, so the tabs fill the window. */}
      <ShellMain $size="auto">
        {/* The tabs have no padding, so while the sidebar is open, the first
            tab starts at the edge of the panel, and a selected first tab and
            the panel share a straight edge. */}
        <Tabs
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          $outerEdge={false}
          $darken={false}
          $border="var(--edge)"
          // The sticky row and the frame of the panel keep the margin, so the
          // tabs have the same space on each side while the page scrolls, and
          // the corners are concentric with the shell.
          $m={tabsMargin}
          className="col-[main] row-[main-header-start/body-end]"
        >
          <TabRow $sticky>
            {/* While the sidebar is closed, this invisible copy of the toggle
                button and the logo holds their room, and a grid column folds it
                as the sidebar opens. It is a part of the row, so the scroll
                button starts after it, and the glider counts it. Like a first
                part of a row, it moves onto the edge of the tabs by their
                merge, and the copies have no margin, so the room ends where the
                logo ends. */}
            <span
              aria-hidden
              className={`invisible -ms-(--tabs-merge) grid h-0 shrink-0 transition-[grid-template-columns] duration-(--shell-time) ease-(--shell-ease) ${
                sidebarOpen ? "grid-cols-[0fr]" : "grid-cols-[1fr]"
              }`}
            >
              <span className="flex min-w-0">
                <TabRowFrame $p="var(--tab-padding)" $m={0}>
                  <TabSlot />
                </TabRowFrame>
                <NotesLogo separator $m={0} />
              </span>
            </span>
            <TabList aria-label="Open notes" onReorder={reorderNotes}>
              <Glider />
              {notes.map((note, index) => (
                <Tab
                  key={note.id}
                  id={note.id}
                  $p="var(--tab-padding)"
                  // While the sidebar is closed, the first tab is after the
                  // logo, so it also has a separator.
                  separator={!!index || !sidebarOpen}
                  onRemove={closable ? () => removeNote(note.id) : undefined}
                >
                  {note.name}
                </Tab>
              ))}
            </TabList>
            {/* A button after the tab list, not a tab, opens a tab. It shows
                only an icon, so a tooltip shows its name. */}
            <Tooltip text="New note">
              <TabRowButton
                aria-label="New note"
                $p="var(--tab-padding)"
                separator
                onClick={addNote}
              >
                <TabSlot>
                  <PlusIcon />
                </TabSlot>
              </TabRowButton>
            </Tooltip>
          </TabRow>
          <TabPanels $p="none">
            {notes.map((note) => (
              <TabPanel key={note.id} tabId={note.id}>
                {/* The note stays on the center of the window, not of the
                    panel, so it doesn't move when the sidebar opens. */}
                <ShellMainBody $center="outer">
                  <Prose>
                    {note.paragraphs.map((paragraph, index) => (
                      // The paragraphs of a note don't change order.
                      <p key={index}>{paragraph}</p>
                    ))}
                    {!note.paragraphs.length && <p>This note is empty.</p>}
                  </Prose>
                </ShellMainBody>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </ShellMain>
    </Shell>
  );
}
