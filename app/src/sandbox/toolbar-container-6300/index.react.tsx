import * as Ariakit from "@ariakit/react";
import * as React from "react";

interface FontFamilyContainerProps {
  label: string;
  defaultValue?: string;
}

function FontFamilyContainer({
  label,
  defaultValue,
}: FontFamilyContainerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Ariakit.ToolbarContainer
      aria-label={label}
      role="group"
      onKeyDown={(event) => {
        if (event.key !== "Backspace" && event.key !== "Delete") return;
        if (event.target !== event.currentTarget) return;
        const input = inputRef.current;
        if (!input) return;
        if (input.value) return;
        // TODO: Remove this workaround after
        // https://github.com/ariakit/ariakit/issues/6300 is fixed.
        event.preventDefault();
        input.focus();
      }}
    >
      <label>
        {label} <input ref={inputRef} defaultValue={defaultValue} />
      </label>
    </Ariakit.ToolbarContainer>
  );
}

export default function Example() {
  return (
    <>
      <button type="button">Before empty toolbar</button>
      <Ariakit.Toolbar
        aria-label="Empty text formatting"
        style={{ display: "flex", gap: 8 }}
      >
        <FontFamilyContainer label="Empty font family" />
        <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
      <button type="button">Before filled toolbar</button>
      <Ariakit.Toolbar
        aria-label="Filled text formatting"
        style={{ display: "flex", gap: 8 }}
      >
        <FontFamilyContainer label="Font family" defaultValue="Inter" />
        <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </>
  );
}
