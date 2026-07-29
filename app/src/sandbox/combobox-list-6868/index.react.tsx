import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  label: string;
  virtualFocus?: boolean;
}

function BaseElementStatus({ label }: Pick<FruitSelectProps, "label">) {
  const store = Ariakit.useComboboxContext();
  const baseElement = store?.useState("baseElement");
  return (
    <output aria-label={`${label} base element`}>
      {baseElement?.getAttribute("role")}
    </output>
  );
}

function FruitSelect({ label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4}>
        <Ariakit.ComboboxInput aria-label={`Search ${label}`} />
        <button type="button">Review {label} options</button>
        <Ariakit.ComboboxList>
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
      <BaseElementStatus label={label} />
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Virtual focus fruit" />
      <FruitSelect label="Real focus fruit" virtualFocus={false} />
      <button type="button">After selects</button>
    </>
  );
}
