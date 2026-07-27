import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  filter?: boolean;
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ filter, label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth unmountOnHide={filter}>
        {filter && (
          <Ariakit.ComboboxInput autoSelect aria-label={`Filter ${label}`} />
        )}
        <Ariakit.ComboboxList>
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Favorite fruit" />
      <FruitSelect label="Real focus fruit" virtualFocus={false} />
      <FruitSelect filter label="Filterable fruit" />
    </>
  );
}
