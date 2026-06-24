import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Fruit</Ariakit.ComboboxLabel>
        <div>
          <Ariakit.Combobox />
          <Ariakit.ComboboxDisclosure
            onMouseDownCapture={(event) => {
              // TODO: Remove after https://github.com/ariakit/ariakit/issues/6296.
              event.preventDefault();
              event.stopPropagation();
            }}
          />
        </div>
        <Ariakit.ComboboxPopover gutter={4}>
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <label>
        Notes
        <input type="text" />
      </label>
    </div>
  );
}
