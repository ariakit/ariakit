import * as Ariakit from "@ariakit/react";
import { useId, useState } from "react";

const alignments = ["Align Left", "Align Center", "Align Right"] as const;

function BasicToolbar() {
  return (
    <Ariakit.Toolbar aria-label="Basic formatting">
      <Ariakit.ToolbarItem>Undo</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem disabled>Redo</Ariakit.ToolbarItem>
      <Ariakit.ToolbarSeparator />
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}

function DisabledActiveItemToolbar() {
  const disabledId = useId();
  return (
    <>
      <button type="button">Before disabled active item</button>
      <Ariakit.ToolbarProvider defaultActiveId={disabledId}>
        <Ariakit.Toolbar aria-label="Disabled active item">
          <Ariakit.ToolbarItem id={disabledId} disabled>
            Bold
          </Ariakit.ToolbarItem>
          <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
          <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
        </Ariakit.Toolbar>
      </Ariakit.ToolbarProvider>
      <button type="button">After disabled active item</button>
    </>
  );
}

function StaleActiveItemToolbar() {
  const [showItalic, setShowItalic] = useState(true);
  return (
    <>
      <button type="button" tabIndex={0}>
        Before stale active item
      </button>
      <Ariakit.Toolbar aria-label="Stale active item">
        <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
        {showItalic && <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>}
        <Ariakit.ToolbarItem tabIndex={0}>Underline</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <button
        type="button"
        tabIndex={0}
        onClick={() => setShowItalic((show) => !show)}
      >
        Toggle italic
      </button>
    </>
  );
}

function SelectToolbar() {
  const [value, setValue] = useState("Align Left");
  return (
    <Ariakit.Toolbar aria-label="Selectable text formatting">
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
      <Ariakit.ToolbarSeparator />
      <Ariakit.ComboboxProvider
        selectedValue={value}
        setSelectedValue={setValue}
      >
        <Ariakit.ComboboxSelect
          aria-label="Text alignment"
          render={<Ariakit.ToolbarItem />}
        >
          {value}
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover gutter={4} className="flex flex-col p-1">
          {alignments.map((alignment) => (
            <Ariakit.ComboboxItem
              key={alignment}
              value={alignment}
              className="p-2"
            />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </Ariakit.Toolbar>
  );
}

export default function Example() {
  return (
    <main>
      <section>
        <h2>Basic navigation</h2>
        <BasicToolbar />
      </section>
      <section>
        <h2>Disabled active item</h2>
        <DisabledActiveItemToolbar />
      </section>
      <section>
        <h2>Stale active item</h2>
        <StaleActiveItemToolbar />
      </section>
      <section>
        <h2>Select composition</h2>
        <SelectToolbar />
      </section>
    </main>
  );
}
