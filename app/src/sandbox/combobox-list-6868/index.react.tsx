import * as Ariakit from "@ariakit/react";

function BaseElementStatus() {
  const store = Ariakit.useComboboxContext();
  const baseElement = store?.useState("baseElement");
  return (
    <output aria-label="Composite base element">
      {baseElement?.getAttribute("role")}
    </output>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.ComboboxProvider
        defaultSelectedValue="Apple"
        virtualFocus={false}
      >
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4}>
          <Ariakit.ComboboxInput aria-label="Search fruits" />
          <button type="button">Review options</button>
          <Ariakit.ComboboxList>
            <Ariakit.ComboboxItem value="Apple" />
            <Ariakit.ComboboxItem value="Banana" />
            <Ariakit.ComboboxItem value="Orange" />
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
        <BaseElementStatus />
      </Ariakit.ComboboxProvider>
      <button type="button">After select</button>
    </>
  );
}
