import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>Favorite food</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        <Ariakit.ComboboxGroup>
          <Ariakit.ComboboxGroupLabel>
            Fruits &amp; Vegetables
          </Ariakit.ComboboxGroupLabel>
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Grape" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxGroup>
        <Ariakit.ComboboxGroup>
          <Ariakit.ComboboxGroupLabel>Dairy</Ariakit.ComboboxGroupLabel>
          <Ariakit.ComboboxItem value="Milk" />
          <Ariakit.ComboboxItem value="Cheese" />
          <Ariakit.ComboboxItem value="Yogurt" />
        </Ariakit.ComboboxGroup>
        <Ariakit.ComboboxGroup>
          <Ariakit.ComboboxGroupLabel>Beverages</Ariakit.ComboboxGroupLabel>
          <Ariakit.ComboboxItem value="Water" />
          <Ariakit.ComboboxItem value="Juice" />
          <Ariakit.ComboboxItem value="Soda" />
        </Ariakit.ComboboxGroup>
        <Ariakit.ComboboxGroup>
          <Ariakit.ComboboxGroupLabel>Snacks</Ariakit.ComboboxGroupLabel>
          <Ariakit.ComboboxItem value="Chips" />
          <Ariakit.ComboboxItem value="Nuts" />
          <Ariakit.ComboboxItem value="Candy" />
        </Ariakit.ComboboxGroup>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
