import * as Ariakit from "@ariakit/react";

const values = ["Apple", "Banana"];

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>Favorite fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect>
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover>
        <Ariakit.ComboboxLabel>Search fruits</Ariakit.ComboboxLabel>
        <Ariakit.ComboboxInput />
        <Ariakit.ComboboxList>
          {values.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
