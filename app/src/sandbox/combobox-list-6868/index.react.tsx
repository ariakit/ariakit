import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <>
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4}>
          <Ariakit.ComboboxInput aria-label="Search fruits" />
          <Ariakit.ComboboxList style={{ height: 40, overflow: "auto" }}>
            <Ariakit.ComboboxItem value="Apple" style={{ height: 40 }} />
            <Ariakit.ComboboxItem value="Banana" style={{ height: 40 }} />
            <Ariakit.ComboboxItem value="Orange" style={{ height: 40 }} />
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <button type="button">After select</button>
    </>
  );
}
