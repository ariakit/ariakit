import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  focusable?: boolean;
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ focusable, label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        <Ariakit.ComboboxList focusable={focusable}>
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
      <FruitSelect label="Favorite fruit" focusable={false} />
      <FruitSelect label="Virtual focus fruit" />
      <FruitSelect
        label="Real focus fruit"
        focusable={false}
        virtualFocus={false}
      />
    </>
  );
}
