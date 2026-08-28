import * as Ariakit from "@ariakit/react";
import { useState } from "react";

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

export default function Example() {
  return (
    <>
      <GoToFile />
      <RunCommand />
      <FruitSearch />
    </>
  );
}
