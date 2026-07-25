import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
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
    </>
  );
}
