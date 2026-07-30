import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  focusable?: boolean;
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

function FruitSelect({ focusable, label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Banana"
      selectOnMove
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} autoFocusOnHide={false}>
        <Ariakit.ComboboxInput aria-label={`Search ${label}`} />
        <button type="button" tabIndex={0}>
          Review {label} options
        </button>
        <Ariakit.ComboboxList focusable={focusable}>
          <Ariakit.ComboboxItem disabled value="Apricot" />
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
          <Ariakit.ComboboxItem disabled value="Pear" />
        </Ariakit.ComboboxList>
        <button type="button" tabIndex={0}>
          After {label} options
        </button>
      </Ariakit.ComboboxPopover>
      <BaseElementStatus label={label} />
      <SelectedValueStatus label={label} />
    </Ariakit.ComboboxProvider>
  );
}

function GridFruitSelect() {
  return (
    <Ariakit.ComboboxProvider
      defaultActiveId={null}
      defaultSelectedValue=""
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

function ExternalBaseFruitSelect() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Banana" virtualFocus>
      <Ariakit.ComboboxSelect aria-label="External base fruit" />
      <Ariakit.ComboboxPopover autoFocusOnHide={false} gutter={4}>
        <Ariakit.ComboboxList aria-label="External base fruit options">
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
      <button type="button" tabIndex={0}>
        After external base fruit
      </button>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Virtual focus fruit" />
      <FruitSelect label="Real focus fruit" virtualFocus={false} />
      <FruitSelect label="Unfocusable list fruit" focusable={false} />
      <GridFruitSelect />
      <ExternalBaseFruitSelect />
      <button type="button">After selects</button>
    </>
  );
}
