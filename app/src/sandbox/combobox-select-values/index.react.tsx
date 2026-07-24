import * as Ariakit from "@ariakit/react";

const values = ["Apple", "Banana"];

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelect aria-label="Favorite fruit">
        <Ariakit.ComboboxSelectedValue fallback="No fruit" />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value}>
            <Ariakit.ComboboxItemSelected>
              {(selected) => (
                <span aria-hidden data-selected={selected || undefined}>
                  {selected ? "✓" : null}
                </span>
              )}
            </Ariakit.ComboboxItemSelected>
            {value}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
