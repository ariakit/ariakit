import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface FileEntry {
  id: string;
  label: string;
  folder?: boolean;
  parent?: string;
}

const files: FileEntry[] = [
  { id: "src", label: "src", folder: true },
  { id: "src/app.tsx", label: "app.tsx", parent: "src" },
  { id: "src/main.tsx", label: "main.tsx", parent: "src" },
  { id: "readme.md", label: "readme.md" },
];

const commands = ["Reload window", "Toggle sidebar", "Split editor"];

const fruits = ["Apple", "Banana", "Cherry"];

function GoToFile() {
  const [value, setValue] = useState("");
  const matches = files.filter((file) =>
    file.label.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <Ariakit.ComboboxProvider inputValue={value} setInputValue={setValue}>
      <Ariakit.Combobox aria-label="Go to file" />
      <Ariakit.ComboboxPopover gutter={4} aria-label="Go to file results">
        {/* A tree may only own treeitem and group children, so the live count
            has to stay outside the nested list. */}
        <div role="status">
          {matches.length} of {files.length} files
        </div>
        <Ariakit.ComboboxList role="tree" aria-label="Files">
          {matches.map((file) => (
            <Ariakit.ComboboxItem
              key={file.id}
              value={file.label}
              aria-level={file.parent ? 2 : 1}
              aria-expanded={file.folder || undefined}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function RunCommand() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox aria-label="Run command" />
      <Ariakit.ComboboxPopover gutter={4} aria-label="Command results">
        <Ariakit.ComboboxList role="menu" aria-label="Commands">
          {commands.map((command) => (
            <Ariakit.ComboboxItem key={command} value={command} />
          ))}
        </Ariakit.ComboboxList>
        {/* A menu may only own menuitem, menuitemcheckbox, menuitemradio,
            group and separator children, so the footer hint has to stay
            outside the nested list. */}
        <div>Press Enter to run</div>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// Stands in for a third-party widget that ships its own listbox. The combobox
// does not own this markup and must not hand its popup role over to it.
function RecentlyUsed() {
  return (
    <div role="listbox" aria-label="Recently used">
      <div role="option" aria-selected={false}>
        Papaya
      </div>
    </div>
  );
}

function FruitSearch() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox aria-label="Search fruits" />
      <Ariakit.ComboboxPopover gutter={4} aria-label="Fruit results">
        {fruits.map((fruit) => (
          <Ariakit.ComboboxItem key={fruit} value={fruit} />
        ))}
        <RecentlyUsed />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// A wrapper that fixes the popover composition usually renders the list through
// the popover, so both share one element and only one of them may carry the
// popup role.
function SearchTags() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox aria-label="Search tags" />
      <Ariakit.ComboboxPopover
        gutter={4}
        aria-label="Tag results"
        render={<Ariakit.ComboboxList />}
      >
        <Ariakit.ComboboxItem value="Design" />
        <Ariakit.ComboboxItem value="Docs" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// The same shared element, but with a real nested list inside it. That list
// must take the popup role from both hooks that share the outer element.
function SearchIssues() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox aria-label="Search issues" />
      <Ariakit.ComboboxPopover
        gutter={4}
        aria-label="Issue results"
        render={<Ariakit.ComboboxList />}
      >
        <div role="status">2 issues</div>
        <Ariakit.ComboboxList aria-label="Issues">
          <Ariakit.ComboboxItem value="Bug report" />
          <Ariakit.ComboboxItem value="Feature request" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// A list for the same store can be rendered outside the popup, for example
// into a side panel. It is not inside the popup, so it does not take the popup
// role and the popover keeps owning its own items.
function SearchDocs() {
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox aria-label="Search docs" />
      <Ariakit.ComboboxPopover gutter={4} aria-label="Doc results">
        <Ariakit.ComboboxItem value="Getting started" />
        <Ariakit.ComboboxItem value="Styling" />
        {panel &&
          createPortal(
            <Ariakit.ComboboxList aria-label="Pinned docs">
              <Ariakit.ComboboxItem value="Changelog" />
            </Ariakit.ComboboxList>,
            panel,
          )}
      </Ariakit.ComboboxPopover>
      <div ref={setPanel} />
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <GoToFile />
      <RunCommand />
      <FruitSearch />
      <SearchTags />
      <SearchIssues />
      <SearchDocs />
    </>
  );
}
