import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultOpen defaultSelectedValue="Onion">
      <Ariakit.ComboboxSelectLabel>Vegetable</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover>
        <Ariakit.ComboboxList>
          <Ariakit.ComboboxItem value="Carrot" />
          <Ariakit.ComboboxItem value="Onion" />
          <Ariakit.ComboboxItem value="Potato" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
