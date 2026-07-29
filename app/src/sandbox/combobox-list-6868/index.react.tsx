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

function SelectedValueStatus({ label }: Pick<FruitSelectProps, "label">) {
  const store = Ariakit.useComboboxContext();
  const selectedValue = store?.useState("selectedValue");
  return (
    <output aria-label={`${label} selected value`}>{selectedValue}</output>
  );
}

function FruitSelect({ label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Banana"
      selectOnMove
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4}>
        <Ariakit.ComboboxInput aria-label={`Search ${label}`} />
        <button type="button">Review {label} options</button>
        <Ariakit.ComboboxList>
          <Ariakit.ComboboxItem disabled value="Apricot" />
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
          <Ariakit.ComboboxItem disabled value="Pear" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
      <BaseElementStatus label={label} />
      <SelectedValueStatus label={label} />
    </Ariakit.ComboboxProvider>
  );
}

function GridFruitSelect() {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Top Center"
      rtl
      virtualFocus={false}
    >
      <Ariakit.ComboboxSelectLabel>Grid fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4}>
        <Ariakit.ComboboxInput aria-label="Search Grid fruit" />
        <Ariakit.ComboboxList role="grid" aria-label="Grid fruit" dir="rtl">
          <Ariakit.ComboboxRow>
            <Ariakit.ComboboxItem role="gridcell" value="Top Left" />
            <Ariakit.ComboboxItem role="gridcell" value="Top Center" />
            <Ariakit.ComboboxItem role="gridcell" value="Top Right" />
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow>
            <Ariakit.ComboboxItem role="gridcell" value="Bottom Left" />
            <Ariakit.ComboboxItem role="gridcell" value="Bottom Center" />
            <Ariakit.ComboboxItem role="gridcell" value="Bottom Right" />
          </Ariakit.ComboboxRow>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Virtual focus fruit" />
      <FruitSelect label="Real focus fruit" virtualFocus={false} />
      <GridFruitSelect />
      <button type="button">After selects</button>
    </>
  );
}
